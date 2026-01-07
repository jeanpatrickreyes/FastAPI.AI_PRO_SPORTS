"""
AI PRO SPORTS - Odds API Routes
Enterprise-grade odds management with multi-sportsbook support
"""

from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.core.cache import cache_manager


router = APIRouter(tags=["odds"])


# ============================================================================
# SCHEMAS
# ============================================================================

class OddsLine(BaseModel):
    sportsbook: str
    spread_home: Optional[float] = None
    spread_away: Optional[float] = None
    spread_home_odds: Optional[int] = None
    spread_away_odds: Optional[int] = None
    total: Optional[float] = None
    over_odds: Optional[int] = None
    under_odds: Optional[int] = None
    moneyline_home: Optional[int] = None
    moneyline_away: Optional[int] = None
    recorded_at: datetime


class GameOdds(BaseModel):
    game_id: int
    sport_code: str
    home_team: str
    away_team: str
    game_date: datetime
    odds: List[OddsLine]
    consensus_spread: Optional[float] = None
    consensus_total: Optional[float] = None
    best_home_spread_odds: Optional[int] = None
    best_away_spread_odds: Optional[int] = None
    best_over_odds: Optional[int] = None
    best_under_odds: Optional[int] = None
    best_home_ml: Optional[int] = None
    best_away_ml: Optional[int] = None


class OddsMovement(BaseModel):
    game_id: int
    sportsbook: str
    bet_type: str  # spread, total, moneyline
    opening_line: float
    current_line: float
    movement: float
    opening_odds: Optional[int] = None
    current_odds: Optional[int] = None
    direction: str  # up, down, unchanged
    recorded_at: datetime


class ClosingLine(BaseModel):
    game_id: int
    sport_code: str
    pinnacle_spread: Optional[float] = None
    pinnacle_total: Optional[float] = None
    pinnacle_home_ml: Optional[int] = None
    pinnacle_away_ml: Optional[int] = None
    consensus_spread: Optional[float] = None
    consensus_total: Optional[float] = None
    recorded_at: datetime


class BestOdds(BaseModel):
    game_id: int
    bet_type: str
    side: str
    line: Optional[float] = None
    best_odds: int
    sportsbook: str
    comparison: List[dict]


class OddsRefreshResponse(BaseModel):
    status: str
    games_updated: int
    odds_recorded: int
    timestamp: datetime


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/{game_id}", response_model=GameOdds)
async def get_game_odds(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get current odds from all sportsbooks for a specific game.
    """
    cache_key = f"odds:game:{game_id}"
    
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    # Get game info
    game_query = """
        SELECT 
            g.id, g.sport_code, g.game_date,
            ht.name as home_team, at.name as away_team
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        WHERE g.id = :game_id
    """
    
    game_result = await db.execute(game_query, {"game_id": game_id})
    game = game_result.fetchone()
    
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Game {game_id} not found"
        )
    
    # Get latest odds from each sportsbook
    odds_query = """
        SELECT DISTINCT ON (sportsbook)
            sportsbook,
            spread_home, spread_away,
            spread_home_odds, spread_away_odds,
            total, over_odds, under_odds,
            moneyline_home, moneyline_away,
            recorded_at
        FROM odds
        WHERE game_id = :game_id
        ORDER BY sportsbook, recorded_at DESC
    """
    
    odds_result = await db.execute(odds_query, {"game_id": game_id})
    odds_rows = odds_result.fetchall()
    
    odds_lines = [
        OddsLine(
            sportsbook=row.sportsbook,
            spread_home=row.spread_home,
            spread_away=row.spread_away,
            spread_home_odds=row.spread_home_odds,
            spread_away_odds=row.spread_away_odds,
            total=row.total,
            over_odds=row.over_odds,
            under_odds=row.under_odds,
            moneyline_home=row.moneyline_home,
            moneyline_away=row.moneyline_away,
            recorded_at=row.recorded_at
        )
        for row in odds_rows
    ]
    
    # Calculate consensus and best odds
    spreads = [o.spread_home for o in odds_lines if o.spread_home is not None]
    totals = [o.total for o in odds_lines if o.total is not None]
    
    consensus_spread = sum(spreads) / len(spreads) if spreads else None
    consensus_total = sum(totals) / len(totals) if totals else None
    
    # Best odds
    home_spread_odds = [o.spread_home_odds for o in odds_lines if o.spread_home_odds]
    away_spread_odds = [o.spread_away_odds for o in odds_lines if o.spread_away_odds]
    over_odds = [o.over_odds for o in odds_lines if o.over_odds]
    under_odds = [o.under_odds for o in odds_lines if o.under_odds]
    home_mls = [o.moneyline_home for o in odds_lines if o.moneyline_home]
    away_mls = [o.moneyline_away for o in odds_lines if o.moneyline_away]
    
    response = GameOdds(
        game_id=game.id,
        sport_code=game.sport_code,
        home_team=game.home_team,
        away_team=game.away_team,
        game_date=game.game_date,
        odds=odds_lines,
        consensus_spread=round(consensus_spread, 1) if consensus_spread else None,
        consensus_total=round(consensus_total, 1) if consensus_total else None,
        best_home_spread_odds=max(home_spread_odds) if home_spread_odds else None,
        best_away_spread_odds=max(away_spread_odds) if away_spread_odds else None,
        best_over_odds=max(over_odds) if over_odds else None,
        best_under_odds=max(under_odds) if under_odds else None,
        best_home_ml=max(home_mls) if home_mls else None,
        best_away_ml=max(away_mls) if away_mls else None
    )
    
    # Cache for 60 seconds
    await cache_manager.set(cache_key, response.dict(), ttl=60)
    
    return response


@router.get("/{game_id}/best", response_model=List[BestOdds])
async def get_best_odds(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get best available odds across all sportsbooks for each bet type.
    """
    # Get latest odds from each sportsbook
    odds_query = """
        SELECT DISTINCT ON (sportsbook)
            sportsbook,
            spread_home, spread_away,
            spread_home_odds, spread_away_odds,
            total, over_odds, under_odds,
            moneyline_home, moneyline_away,
            recorded_at
        FROM odds
        WHERE game_id = :game_id
        ORDER BY sportsbook, recorded_at DESC
    """
    
    odds_result = await db.execute(odds_query, {"game_id": game_id})
    odds_rows = odds_result.fetchall()
    
    if not odds_rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No odds found for game {game_id}"
        )
    
    best_odds_list = []
    
    # Home spread
    home_spread_data = [
        {"sportsbook": r.sportsbook, "line": r.spread_home, "odds": r.spread_home_odds}
        for r in odds_rows if r.spread_home_odds is not None
    ]
    if home_spread_data:
        best = max(home_spread_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="spread",
            side="home",
            line=best["line"],
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=home_spread_data
        ))
    
    # Away spread
    away_spread_data = [
        {"sportsbook": r.sportsbook, "line": r.spread_away, "odds": r.spread_away_odds}
        for r in odds_rows if r.spread_away_odds is not None
    ]
    if away_spread_data:
        best = max(away_spread_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="spread",
            side="away",
            line=best["line"],
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=away_spread_data
        ))
    
    # Over
    over_data = [
        {"sportsbook": r.sportsbook, "line": r.total, "odds": r.over_odds}
        for r in odds_rows if r.over_odds is not None
    ]
    if over_data:
        best = max(over_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="total",
            side="over",
            line=best["line"],
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=over_data
        ))
    
    # Under
    under_data = [
        {"sportsbook": r.sportsbook, "line": r.total, "odds": r.under_odds}
        for r in odds_rows if r.under_odds is not None
    ]
    if under_data:
        best = max(under_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="total",
            side="under",
            line=best["line"],
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=under_data
        ))
    
    # Home ML
    home_ml_data = [
        {"sportsbook": r.sportsbook, "odds": r.moneyline_home}
        for r in odds_rows if r.moneyline_home is not None
    ]
    if home_ml_data:
        best = max(home_ml_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="moneyline",
            side="home",
            line=None,
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=home_ml_data
        ))
    
    # Away ML
    away_ml_data = [
        {"sportsbook": r.sportsbook, "odds": r.moneyline_away}
        for r in odds_rows if r.moneyline_away is not None
    ]
    if away_ml_data:
        best = max(away_ml_data, key=lambda x: x["odds"])
        best_odds_list.append(BestOdds(
            game_id=game_id,
            bet_type="moneyline",
            side="away",
            line=None,
            best_odds=best["odds"],
            sportsbook=best["sportsbook"],
            comparison=away_ml_data
        ))
    
    return best_odds_list


@router.get("/{game_id}/movement", response_model=List[OddsMovement])
async def get_odds_movement(
    game_id: int,
    sportsbook: Optional[str] = Query(None, description="Filter by sportsbook"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get line movement history for a game.
    """
    conditions = ["game_id = :game_id"]
    params = {"game_id": game_id}
    
    if sportsbook:
        conditions.append("sportsbook = :sportsbook")
        params["sportsbook"] = sportsbook
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            game_id, sportsbook, bet_type,
            opening_line, current_line, movement,
            opening_odds, current_odds, recorded_at
        FROM odds_movements
        WHERE {where_clause}
        ORDER BY recorded_at DESC
    """
    
    result = await db.execute(query, params)
    rows = result.fetchall()
    
    movements = []
    for row in rows:
        direction = "unchanged"
        if row.movement > 0:
            direction = "up"
        elif row.movement < 0:
            direction = "down"
        
        movements.append(OddsMovement(
            game_id=row.game_id,
            sportsbook=row.sportsbook,
            bet_type=row.bet_type,
            opening_line=row.opening_line,
            current_line=row.current_line,
            movement=row.movement,
            opening_odds=row.opening_odds,
            current_odds=row.current_odds,
            direction=direction,
            recorded_at=row.recorded_at
        ))
    
    return movements


@router.get("/{game_id}/closing", response_model=ClosingLine)
async def get_closing_line(
    game_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get closing line for a completed game (used for CLV calculation).
    """
    query = """
        SELECT 
            cl.*,
            g.sport_code
        FROM closing_lines cl
        JOIN games g ON cl.game_id = g.id
        WHERE cl.game_id = :game_id
    """
    
    result = await db.execute(query, {"game_id": game_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Closing line for game {game_id} not found"
        )
    
    return ClosingLine(
        game_id=row.game_id,
        sport_code=row.sport_code,
        pinnacle_spread=row.pinnacle_spread,
        pinnacle_total=row.pinnacle_total,
        pinnacle_home_ml=row.pinnacle_home_ml,
        pinnacle_away_ml=row.pinnacle_away_ml,
        consensus_spread=row.consensus_spread,
        consensus_total=row.consensus_total,
        recorded_at=row.recorded_at
    )


@router.get("/live", response_model=List[GameOdds])
async def get_live_odds(
    sport: Optional[str] = Query(None, description="Filter by sport code"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get live odds for upcoming games within the next 24 hours.
    """
    cache_key = f"odds:live:{sport or 'all'}"
    
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    now = datetime.utcnow()
    tomorrow = now + timedelta(hours=24)
    
    conditions = [
        "g.game_date >= :now",
        "g.game_date <= :tomorrow",
        "g.status = 'scheduled'"
    ]
    params = {"now": now, "tomorrow": tomorrow}
    
    if sport:
        conditions.append("g.sport_code = :sport")
        params["sport"] = sport.upper()
    
    where_clause = " AND ".join(conditions)
    
    games_query = f"""
        SELECT 
            g.id, g.sport_code, g.game_date,
            ht.name as home_team, at.name as away_team
        FROM games g
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        WHERE {where_clause}
        ORDER BY g.game_date ASC
        LIMIT 100
    """
    
    games_result = await db.execute(games_query, params)
    games = games_result.fetchall()
    
    live_odds = []
    
    for game in games:
        odds_query = """
            SELECT DISTINCT ON (sportsbook)
                sportsbook,
                spread_home, spread_away,
                spread_home_odds, spread_away_odds,
                total, over_odds, under_odds,
                moneyline_home, moneyline_away,
                recorded_at
            FROM odds
            WHERE game_id = :game_id
            ORDER BY sportsbook, recorded_at DESC
        """
        
        odds_result = await db.execute(odds_query, {"game_id": game.id})
        odds_rows = odds_result.fetchall()
        
        odds_lines = [
            OddsLine(
                sportsbook=row.sportsbook,
                spread_home=row.spread_home,
                spread_away=row.spread_away,
                spread_home_odds=row.spread_home_odds,
                spread_away_odds=row.spread_away_odds,
                total=row.total,
                over_odds=row.over_odds,
                under_odds=row.under_odds,
                moneyline_home=row.moneyline_home,
                moneyline_away=row.moneyline_away,
                recorded_at=row.recorded_at
            )
            for row in odds_rows
        ]
        
        if odds_lines:
            spreads = [o.spread_home for o in odds_lines if o.spread_home is not None]
            totals = [o.total for o in odds_lines if o.total is not None]
            
            live_odds.append(GameOdds(
                game_id=game.id,
                sport_code=game.sport_code,
                home_team=game.home_team,
                away_team=game.away_team,
                game_date=game.game_date,
                odds=odds_lines,
                consensus_spread=round(sum(spreads)/len(spreads), 1) if spreads else None,
                consensus_total=round(sum(totals)/len(totals), 1) if totals else None
            ))
    
    # Cache for 60 seconds
    await cache_manager.set(cache_key, [o.dict() for o in live_odds], ttl=60)
    
    return live_odds


@router.post("/refresh", response_model=OddsRefreshResponse)
async def refresh_odds(
    sport: Optional[str] = Query(None, description="Sport code to refresh"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger refresh of odds from TheOddsAPI.
    Requires admin role.
    """
    if current_user.get("role") not in ["admin", "system"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    from app.services.collectors.odds_collector import odds_collector
    
    try:
        # Collect odds from TheOddsAPI
        if sport:
            result = await odds_collector.collect(sport_code=sport.upper())
        else:
            result = await odds_collector.collect()
        
        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to collect odds: {result.error}"
            )
        
        # Save to database
        saved_count = 0
        if result.data:
            saved_count = await odds_collector.save_to_database(result.data, db)
        
        # Clear odds cache
        await cache_manager.delete_pattern("odds:*")
        
        return OddsRefreshResponse(
            status="success",
            games_updated=result.records_count,  # Number of odds records collected
            odds_recorded=saved_count,  # Number actually saved to DB
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh odds: {str(e)}"
        )


@router.get("/sportsbooks", response_model=List[str])
async def get_available_sportsbooks(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of available sportsbooks in the system.
    """
    query = """
        SELECT DISTINCT sportsbook
        FROM odds
        ORDER BY sportsbook
    """
    
    result = await db.execute(query)
    rows = result.fetchall()
    
    return [row.sportsbook for row in rows]


@router.get("/api-status")
async def get_odds_api_status(
    current_user: dict = Depends(get_current_user)
):
    """
    Get TheOddsAPI rate limit status.
    """
    if current_user.get("role") not in ["admin", "system"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    from app.services.collectors.odds_collector import odds_collector
    
    status = await odds_collector.get_api_status()
    
    return {
        "requests_used": status.get("requests_used", 0),
        "requests_remaining": status.get("requests_remaining", 0),
        "monthly_limit": status.get("monthly_limit", 500),
        "reset_date": status.get("reset_date"),
        "last_request": status.get("last_request")
    }


@router.get("/all", response_model=List[dict])
async def get_all_odds(
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of odds to return"),
    sport: Optional[str] = Query(None, description="Filter by sport code"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all odds from the database.
    Useful for viewing what odds have been collected.
    """
    query = """
        SELECT 
            o.id,
            o.game_id,
            g.sport_code,
            g.game_date,
            ht.name as home_team,
            at.name as away_team,
            sb.name as sportsbook_name,
            o.market_type,
            o.selection,
            o.price,
            o.line,
            o.is_current,
            o.recorded_at
        FROM odds o
        JOIN games g ON o.game_id = g.id
        JOIN teams ht ON g.home_team_id = ht.id
        JOIN teams at ON g.away_team_id = at.id
        JOIN sportsbooks sb ON o.sportsbook_id = sb.id
        WHERE o.is_current = true
    """
    
    params = {}
    if sport:
        query += " AND g.sport_code = :sport"
        params["sport"] = sport.upper()
    
    query += " ORDER BY o.recorded_at DESC LIMIT :limit"
    params["limit"] = limit
    
    result = await db.execute(query, params)
    rows = result.fetchall()
    
    return [
        {
            "id": str(row.id),
            "game_id": str(row.game_id),
            "sport_code": row.sport_code,
            "game_date": row.game_date.isoformat() if row.game_date else None,
            "home_team": row.home_team,
            "away_team": row.away_team,
            "sportsbook": row.sportsbook_name,
            "market_type": row.market_type,
            "selection": row.selection,
            "price": row.price,
            "line": row.line,
            "is_current": row.is_current,
            "recorded_at": row.recorded_at.isoformat() if row.recorded_at else None,
        }
        for row in rows
    ]
