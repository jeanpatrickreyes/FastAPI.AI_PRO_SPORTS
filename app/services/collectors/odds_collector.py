"""
AI PRO SPORTS - TheOddsAPI Collector
Phase 1: Data Collection Services

Collects real-time odds from 40+ sportsbooks via TheOddsAPI.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings, ODDS_API_SPORT_KEYS
from app.models import Game, Odds, Sportsbook, OddsMovement
from app.services.collectors.base_collector import (
    BaseCollector,
    CollectorResult,
    collector_manager,
)

logger = logging.getLogger(__name__)


class OddsCollector(BaseCollector):
    """
    Collector for TheOddsAPI.
    
    Features:
    - Real-time odds from 40+ sportsbooks
    - Support for spreads, moneylines, and totals
    - Line movement detection
    - Rate limit tracking
    """
    
    MARKETS = ["spreads", "h2h", "totals"]  # spread, moneyline, total
    MARKET_TYPE_MAP = {
        "spreads": "spread",
        "h2h": "moneyline",
        "totals": "total",
    }
    
    def __init__(self):
        super().__init__(
            name="odds_api",
            base_url=settings.ODDS_API_BASE_URL,
            rate_limit=500,  # Monthly limit tracked separately
            rate_window=3600,
        )
        self.api_key = settings.ODDS_API_KEY
        self._requests_used = 0
        self._requests_remaining = 500
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers."""
        return {
            "Accept": "application/json",
        }
    
    async def collect(
        self,
        sport_code: str = None,
        markets: List[str] = None,
        **kwargs,
    ) -> CollectorResult:
        """
        Collect odds for specified sports.
        
        Args:
            sport_code: Optional sport code (collects all if None)
            markets: List of markets to collect (spreads, h2h, totals)
            
        Returns:
            CollectorResult with odds data
        """
        if not self.api_key:
            return CollectorResult(
                success=False,
                error="TheOddsAPI key not configured",
            )
        
        sports_to_collect = (
            [sport_code] if sport_code 
            else list(ODDS_API_SPORT_KEYS.keys())
        )
        
        markets = markets or self.MARKETS
        all_odds = []
        errors = []
        
        for sport in sports_to_collect:
            try:
                odds_data = await self._collect_sport_odds(sport, markets)
                all_odds.extend(odds_data)
            except Exception as e:
                logger.error(f"Error collecting {sport} odds: {e}")
                errors.append(f"{sport}: {str(e)}")
        
        return CollectorResult(
            success=len(errors) == 0,
            data=all_odds,
            records_count=len(all_odds),
            error="; ".join(errors) if errors else None,
            metadata={
                "sports_collected": sports_to_collect,
                "markets": markets,
                "requests_remaining": self._requests_remaining,
            },
        )
    
    async def _collect_sport_odds(
        self,
        sport_code: str,
        markets: List[str],
    ) -> List[Dict[str, Any]]:
        """Collect odds for a single sport."""
        api_sport_key = ODDS_API_SPORT_KEYS.get(sport_code)
        if not api_sport_key:
            logger.warning(f"Unknown sport code: {sport_code}")
            return []
        
        params = {
            "apiKey": self.api_key,
            "regions": "us",
            "markets": ",".join(markets),
            "oddsFormat": "american",
        }
        
        try:
            data = await self.get(f"/sports/{api_sport_key}/odds", params=params)
            return self._parse_odds_response(data, sport_code)
        except Exception as e:
            logger.error(f"Failed to fetch {sport_code} odds: {e}")
            raise
    
    def _parse_odds_response(
        self,
        data: List[Dict[str, Any]],
        sport_code: str,
    ) -> List[Dict[str, Any]]:
        """Parse TheOddsAPI response into normalized odds records."""
        parsed_odds = []
        
        for event in data:
            event_id = event.get("id")
            home_team = event.get("home_team")
            away_team = event.get("away_team")
            commence_time = event.get("commence_time")
            
            for bookmaker in event.get("bookmakers", []):
                book_key = bookmaker.get("key")
                book_name = bookmaker.get("title")
                last_update = bookmaker.get("last_update")
                
                for market in bookmaker.get("markets", []):
                    market_key = market.get("key")
                    market_type = self.MARKET_TYPE_MAP.get(market_key, market_key)
                    
                    for outcome in market.get("outcomes", []):
                        outcome_name = outcome.get("name")
                        if outcome_name == home_team:
                            selection = "home"
                        elif outcome_name == away_team:
                            selection = "away"
                        elif outcome_name.lower() == "over":
                            selection = "over"
                        elif outcome_name.lower() == "under":
                            selection = "under"
                        else:
                            selection = outcome_name.lower()
                        
                        odds_record = {
                            "sport_code": sport_code,
                            "external_id": event_id,
                            "home_team": home_team,
                            "away_team": away_team,
                            "commence_time": commence_time,
                            "sportsbook_key": book_key,
                            "sportsbook_name": book_name,
                            "market_type": market_type,
                            "selection": selection,
                            "price": outcome.get("price"),
                            "line": outcome.get("point"),
                            "last_update": last_update,
                        }
                        parsed_odds.append(odds_record)
        
        return parsed_odds
    
    async def validate(self, data: Any) -> bool:
        """Validate odds data."""
        if not isinstance(data, list):
            return False
        
        for record in data:
            if not all([
                record.get("external_id"),
                record.get("sportsbook_key"),
                record.get("market_type"),
                record.get("selection"),
                record.get("price") is not None,
            ]):
                return False
            
            price = record.get("price")
            if price < -10000 or price > 10000:
                logger.warning(f"Suspicious odds value: {price}")
                return False
            
            if record.get("market_type") not in ["spread", "moneyline", "total"]:
                return False
            
            if record.get("selection") not in ["home", "away", "over", "under"]:
                return False
        
        return True
    
    async def save_to_database(
        self,
        odds_data: List[Dict[str, Any]],
        session: AsyncSession,
    ) -> int:
        """
        Save collected odds to database.
        
        Args:
            odds_data: List of parsed odds records
            session: Database session
            
        Returns:
            Number of records saved
        """
        saved_count = 0
        sportsbook_cache: Dict[str, UUID] = {}
        
        for record in odds_data:
            try:
                book_key = record["sportsbook_key"]
                if book_key not in sportsbook_cache:
                    sportsbook = await self._get_or_create_sportsbook(
                        session,
                        book_key,
                        record.get("sportsbook_name", book_key),
                    )
                    sportsbook_cache[book_key] = sportsbook.id
                
                sportsbook_id = sportsbook_cache[book_key]
                
                game_result = await session.execute(
                    select(Game).where(Game.external_id == record["external_id"])
                )
                game = game_result.scalar_one_or_none()
                
                if not game:
                    continue
                
                existing_odds = await session.execute(
                    select(Odds).where(
                        Odds.game_id == game.id,
                        Odds.sportsbook_id == sportsbook_id,
                        Odds.market_type == record["market_type"],
                        Odds.selection == record["selection"],
                        Odds.is_current == True,
                    )
                )
                existing = existing_odds.scalar_one_or_none()
                
                if existing:
                    if (
                        existing.line != record.get("line") or
                        existing.price != record.get("price")
                    ):
                        movement = OddsMovement(
                            game_id=game.id,
                            sportsbook_id=sportsbook_id,
                            market_type=record["market_type"],
                            old_line=existing.line,
                            new_line=record.get("line"),
                            old_price=existing.price,
                            new_price=record.get("price"),
                            movement_size=self._calculate_movement_size(
                                existing.line, record.get("line")
                            ),
                        )
                        session.add(movement)
                        existing.is_current = False
                
                new_odds = Odds(
                    game_id=game.id,
                    sportsbook_id=sportsbook_id,
                    market_type=record["market_type"],
                    selection=record["selection"],
                    price=record["price"],
                    line=record.get("line"),
                    is_current=True,
                )
                session.add(new_odds)
                saved_count += 1
                
            except Exception as e:
                logger.error(f"Error saving odds record: {e}")
                continue
        
        await session.commit()
        return saved_count
    
    async def _get_or_create_sportsbook(
        self,
        session: AsyncSession,
        key: str,
        name: str,
    ) -> Sportsbook:
        """Get or create sportsbook record."""
        result = await session.execute(
            select(Sportsbook).where(Sportsbook.api_key == key)
        )
        sportsbook = result.scalar_one_or_none()
        
        if not sportsbook:
            sharp_books = ["pinnacle", "betcris", "bookmaker"]
            is_sharp = key.lower() in sharp_books
            
            sportsbook = Sportsbook(
                name=name,
                api_key=key,
                is_sharp=is_sharp,
            )
            session.add(sportsbook)
            await session.flush()
        
        return sportsbook
    
    def _calculate_movement_size(
        self,
        old_line: Optional[float],
        new_line: Optional[float],
    ) -> Optional[float]:
        """Calculate line movement size."""
        if old_line is None or new_line is None:
            return None
        return abs(new_line - old_line)
    
    async def get_best_odds(
        self,
        game_id: UUID,
        market_type: str,
        selection: str,
        session: AsyncSession,
    ) -> Optional[Dict[str, Any]]:
        """Get best available odds for a selection."""
        result = await session.execute(
            select(Odds, Sportsbook)
            .join(Sportsbook)
            .where(
                Odds.game_id == game_id,
                Odds.market_type == market_type,
                Odds.selection == selection,
                Odds.is_current == True,
            )
            .order_by(Odds.price.desc())
        )
        
        best = result.first()
        if not best:
            return None
        
        odds, sportsbook = best
        return {
            "sportsbook": sportsbook.name,
            "price": odds.price,
            "line": odds.line,
        }
    
    async def get_sports_list(self) -> List[Dict[str, Any]]:
        """Get list of available sports from TheOddsAPI."""
        params = {"apiKey": self.api_key}
        return await self.get("/sports", params=params)
    
    async def get_events(self, sport_code: str) -> List[Dict[str, Any]]:
        """Get upcoming events for a sport."""
        api_sport_key = ODDS_API_SPORT_KEYS.get(sport_code)
        if not api_sport_key:
            return []
        
        params = {"apiKey": self.api_key}
        return await self.get(f"/sports/{api_sport_key}/events", params=params)


# Create and register collector instance
odds_collector = OddsCollector()
collector_manager.register(odds_collector)
