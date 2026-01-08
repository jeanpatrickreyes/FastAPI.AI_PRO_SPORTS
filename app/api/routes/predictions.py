"""
AI PRO SPORTS - Predictions API Routes
Enterprise-grade predictions endpoints with filtering, pagination, and SHAP explanations
"""

from datetime import datetime, date, timedelta
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, load_only

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.core.cache import cache_manager
from app.models import (
    Prediction as DBPrediction, 
    PredictionResult,
    Game, 
    Sport,
    SignalTier, 
    User, 
    UserRole
)


router = APIRouter(tags=["predictions"])


# ============================================================================
# SCHEMAS
# ============================================================================

class SHAPExplanation(BaseModel):
    feature: str
    value: float
    impact: str  # positive or negative


class PredictionBase(BaseModel):
    id: str  # UUID
    game_id: str  # UUID
    sport_code: Optional[str] = None
    bet_type: str  # spread, moneyline, total
    predicted_side: str
    probability: float
    edge: Optional[float] = None
    signal_tier: Optional[str] = None  # A, B, C, D
    line_at_prediction: Optional[float] = None
    odds_at_prediction: Optional[int] = None
    kelly_fraction: Optional[float] = None
    recommended_bet: Optional[float] = None
    prediction_hash: str
    locked_at: datetime
    model_id: Optional[str] = None  # UUID
    model_version: str = "1.0.0"
    is_graded: bool = False
    result: Optional[str] = None  # win, loss, push
    actual_outcome: Optional[str] = None
    profit_loss: Optional[float] = None
    clv: Optional[float] = None


class PredictionDetail(PredictionBase):
    home_team: str
    away_team: str
    game_date: datetime
    shap_explanations: List[SHAPExplanation] = []
    closing_line: Optional[float] = None
    closing_odds: Optional[int] = None


class PredictionListResponse(BaseModel):
    predictions: List[PredictionBase]
    total: int
    page: int
    per_page: int
    total_pages: int


class PredictionStats(BaseModel):
    total_predictions: int
    graded_predictions: int
    pending_predictions: int
    win_rate: float
    roi: float
    clv_average: float
    tier_a_count: int
    tier_a_win_rate: float
    tier_b_count: int
    tier_b_win_rate: float
    by_sport: dict
    by_bet_type: dict


class GeneratePredictionsRequest(BaseModel):
    sport_code: Optional[str] = None
    game_ids: Optional[List[int]] = None
    bet_types: List[str] = ["spread", "moneyline", "total"]


class GeneratePredictionsResponse(BaseModel):
    generated_count: int
    predictions: List[PredictionBase]
    errors: List[str] = []


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("", response_model=PredictionListResponse)
async def get_predictions(
    sport: Optional[str] = Query(None, description="Filter by sport code"),
    bet_type: Optional[str] = Query(None, description="Filter by bet type"),
    signal_tier: Optional[str] = Query(None, description="Filter by signal tier (A, B, C, D)"),
    is_graded: Optional[bool] = Query(None, description="Filter by graded status"),
    result: Optional[str] = Query(None, description="Filter by result (win, loss, push)"),
    date_from: Optional[date] = Query(None, description="Filter from date"),
    date_to: Optional[date] = Query(None, description="Filter to date"),
    min_probability: Optional[float] = Query(None, ge=0, le=1, description="Minimum probability"),
    min_edge: Optional[float] = Query(None, description="Minimum edge"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get predictions with comprehensive filtering and pagination.
    """
    # Build cache key
    cache_key = f"predictions:{sport}:{bet_type}:{signal_tier}:{is_graded}:{result}:{date_from}:{date_to}:{min_probability}:{min_edge}:{page}:{per_page}"
    
    # Check cache
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    # Build base query with joins for filtering
    base_query = select(DBPrediction).join(Game).join(Sport)
    
    # Apply filters
    conditions = []
    
    if sport:
        conditions.append(Sport.code == sport.upper())
    if bet_type:
        conditions.append(DBPrediction.bet_type == bet_type)
    if signal_tier:
        conditions.append(DBPrediction.signal_tier == signal_tier)
    if date_from:
        conditions.append(func.date(DBPrediction.created_at) >= date_from)
    if date_to:
        conditions.append(func.date(DBPrediction.created_at) <= date_to)
    if min_probability is not None:
        conditions.append(DBPrediction.probability >= min_probability)
    if min_edge is not None:
        conditions.append(DBPrediction.edge >= min_edge)
    if is_graded is not None:
        if is_graded:
            conditions.append(DBPrediction.result.has())
        else:
            conditions.append(~DBPrediction.result.has())
    if result:
        conditions.append(DBPrediction.result.has(PredictionResult.actual_result == result))
    
    if conditions:
        base_query = base_query.where(and_(*conditions))
    
    # Get total count - count IDs only (avoids selecting columns that don't exist in DB)
    count_query = select(func.count(DBPrediction.id)).select_from(DBPrediction).join(Game).join(Sport)
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination and ordering to data query
    offset = (page - 1) * per_page
    data_query = base_query.options(
        load_only(
            DBPrediction.id,
            DBPrediction.game_id,
            DBPrediction.model_id,
            DBPrediction.bet_type,
            DBPrediction.predicted_side,
            DBPrediction.probability,
            DBPrediction.line_at_prediction,
            DBPrediction.odds_at_prediction,
            DBPrediction.edge,
            DBPrediction.signal_tier,
            DBPrediction.kelly_fraction,
            DBPrediction.prediction_hash,
            DBPrediction.created_at
        ),
        selectinload(DBPrediction.game),
        selectinload(DBPrediction.result)
    ).order_by(DBPrediction.created_at.desc()).limit(per_page).offset(offset)
    
    # Execute query
    result = await db.execute(data_query)
    predictions_list = result.scalars().all()
    
    # Get sport codes for all games (since Game doesn't have sport relationship)
    game_ids = [pred.game_id for pred in predictions_list if pred.game_id]
    sport_codes_map = {}
    if game_ids:
        sport_query = select(Game.id, Sport.code).join(Sport, Game.sport_id == Sport.id).where(Game.id.in_(game_ids))
        sport_result = await db.execute(sport_query)
        sport_codes_map = {row.id: row.code for row in sport_result.all()}
    
    # Convert to response models
    predictions = []
    for pred in predictions_list:
        sport_code = sport_codes_map.get(pred.game_id) if pred.game_id else None
        pred_result = pred.result
        
        predictions.append(
            PredictionBase(
                id=str(pred.id),
                game_id=str(pred.game_id),
                sport_code=sport_code,
                bet_type=pred.bet_type,
                predicted_side=pred.predicted_side,
                probability=pred.probability,
                edge=pred.edge,
                signal_tier=pred.signal_tier.value if pred.signal_tier else None,
                line_at_prediction=pred.line_at_prediction,
                odds_at_prediction=pred.odds_at_prediction,
                kelly_fraction=pred.kelly_fraction,
                recommended_bet=None,  # recommended_bet_size column doesn't exist in database
                prediction_hash=pred.prediction_hash,
                locked_at=pred.created_at,  # Using created_at as locked_at
                model_id=str(pred.model_id) if pred.model_id else None,
                model_version="1.0.0",  # TODO: Get from model relationship
                is_graded=pred_result is not None,
                result=pred_result.actual_result.value if pred_result and pred_result.actual_result else None,
                actual_outcome=pred_result.actual_result.value if pred_result and pred_result.actual_result else None,
                profit_loss=pred_result.profit_loss if pred_result else None,
                clv=pred_result.clv if pred_result else None
            )
        )
    
    total_pages = (total + per_page - 1) // per_page
    
    response = PredictionListResponse(
        predictions=predictions,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )
    
    # Cache for 60 seconds
    await cache_manager.set(cache_key, response.dict(), ttl=60)
    
    return response


@router.get("/today", response_model=List[PredictionBase])
async def get_todays_predictions(
    sport: Optional[str] = Query(None, description="Filter by sport code"),
    signal_tier: Optional[str] = Query(None, description="Filter by signal tier"),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get today's predictions with optional sport and tier filtering.
    """
    # Check if demo user - return empty list for demo mode
    if hasattr(current_user, 'id') and str(current_user.id) == "00000000-0000-0000-0000-000000000000":
        return []
    
    cache_key = f"predictions:today:{sport}:{signal_tier}"
    
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    try:
        today = date.today()
        
        conditions = ["DATE(locked_at) = :today"]
        params = {"today": today}
        
        if sport:
            conditions.append("sport_code = :sport")
            params["sport"] = sport
        if signal_tier:
            conditions.append("signal_tier = :signal_tier")
            params["signal_tier"] = signal_tier
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT 
                p.*,
                m.version as model_version
            FROM predictions p
            LEFT JOIN ml_models m ON p.model_id = m.id
            WHERE {where_clause}
            ORDER BY p.probability DESC
        """
        
        result = await db.execute(query, params)
        rows = result.fetchall()
        
        predictions = [
            PredictionBase(
                id=row.id,
                game_id=row.game_id,
                sport_code=row.sport_code,
                bet_type=row.bet_type,
                predicted_side=row.predicted_side,
                probability=row.probability,
                edge=row.edge,
                signal_tier=row.signal_tier,
                line_at_prediction=row.line_at_prediction,
                odds_at_prediction=row.odds_at_prediction,
                kelly_fraction=row.kelly_fraction,
                recommended_bet=row.recommended_bet,
                prediction_hash=row.prediction_hash,
                locked_at=row.locked_at,
                model_id=row.model_id,
                model_version=row.model_version or "1.0.0",
                is_graded=row.is_graded,
                result=row.result,
                actual_outcome=row.actual_outcome,
                profit_loss=row.profit_loss,
                clv=row.clv
            )
            for row in rows
        ]
        
        # Cache for 5 minutes
        await cache_manager.set(cache_key, [p.dict() for p in predictions], ttl=300)
        
        return predictions
    except Exception:
        # If database error, return empty list for demo mode
        if hasattr(current_user, 'id') and str(current_user.id) == "00000000-0000-0000-0000-000000000000":
            return []
        raise


@router.get("/sport/{sport_code}", response_model=List[PredictionBase])
async def get_predictions_by_sport(
    sport_code: str,
    days: int = Query(7, ge=1, le=90, description="Number of days to look back"),
    signal_tier: Optional[str] = Query(None, description="Filter by signal tier"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get predictions for a specific sport.
    """
    valid_sports = ["NFL", "NCAAF", "CFL", "NBA", "NCAAB", "WNBA", "NHL", "MLB", "ATP", "WTA"]
    if sport_code.upper() not in valid_sports:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sport code. Valid codes: {', '.join(valid_sports)}"
        )
    
    from_date = date.today() - timedelta(days=days)
    
    conditions = [
        "sport_code = :sport_code",
        "DATE(locked_at) >= :from_date"
    ]
    params = {"sport_code": sport_code.upper(), "from_date": from_date}
    
    if signal_tier:
        conditions.append("signal_tier = :signal_tier")
        params["signal_tier"] = signal_tier
    
    where_clause = " AND ".join(conditions)
    
    query = f"""
        SELECT 
            p.*,
            m.version as model_version
        FROM predictions p
        LEFT JOIN ml_models m ON p.model_id = m.id
        WHERE {where_clause}
        ORDER BY p.locked_at DESC
        LIMIT 500
    """
    
    result = await db.execute(query, params)
    rows = result.fetchall()
    
    return [
        PredictionBase(
            id=row.id,
            game_id=row.game_id,
            sport_code=row.sport_code,
            bet_type=row.bet_type,
            predicted_side=row.predicted_side,
            probability=row.probability,
            edge=row.edge,
            signal_tier=row.signal_tier,
            line_at_prediction=row.line_at_prediction,
            odds_at_prediction=row.odds_at_prediction,
            kelly_fraction=row.kelly_fraction,
            recommended_bet=row.recommended_bet,
            prediction_hash=row.prediction_hash,
            locked_at=row.locked_at,
            model_id=row.model_id,
            model_version=row.model_version or "1.0.0",
            is_graded=row.is_graded,
            result=row.result,
            actual_outcome=row.actual_outcome,
            profit_loss=row.profit_loss,
            clv=row.clv
        )
        for row in rows
    ]


@router.get("/{prediction_id}", response_model=PredictionDetail)
async def get_prediction_detail(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific prediction including SHAP explanations.
    """
    query = """
        SELECT 
            p.*,
            m.version as model_version,
            g.home_team_id,
            g.away_team_id,
            g.game_date,
            ht.name as home_team,
            at.name as away_team,
            cl.closing_spread,
            cl.closing_total,
            cl.closing_home_ml,
            cl.closing_away_ml
        FROM predictions p
        LEFT JOIN ml_models m ON p.model_id = m.id
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN teams ht ON g.home_team_id = ht.id
        LEFT JOIN teams at ON g.away_team_id = at.id
        LEFT JOIN closing_lines cl ON p.game_id = cl.game_id
        WHERE p.id = :prediction_id
    """
    
    result = await db.execute(query, {"prediction_id": prediction_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction {prediction_id} not found"
        )
    
    # Parse SHAP explanations from JSON
    shap_explanations = []
    if row.shap_values:
        import json
        try:
            shap_data = json.loads(row.shap_values) if isinstance(row.shap_values, str) else row.shap_values
            shap_explanations = [
                SHAPExplanation(
                    feature=item["feature"],
                    value=item["value"],
                    impact="positive" if item["value"] > 0 else "negative"
                )
                for item in shap_data[:10]  # Top 10 features
            ]
        except (json.JSONDecodeError, KeyError):
            pass
    
    # Determine closing line based on bet type
    closing_line = None
    closing_odds = None
    if row.bet_type == "spread":
        closing_line = row.closing_spread
    elif row.bet_type == "total":
        closing_line = row.closing_total
    elif row.bet_type == "moneyline":
        closing_odds = row.closing_home_ml if row.predicted_side == "home" else row.closing_away_ml
    
    return PredictionDetail(
        id=row.id,
        game_id=row.game_id,
        sport_code=row.sport_code,
        bet_type=row.bet_type,
        predicted_side=row.predicted_side,
        probability=row.probability,
        edge=row.edge,
        signal_tier=row.signal_tier,
        line_at_prediction=row.line_at_prediction,
        odds_at_prediction=row.odds_at_prediction,
        kelly_fraction=row.kelly_fraction,
        recommended_bet=row.recommended_bet,
        prediction_hash=row.prediction_hash,
        locked_at=row.locked_at,
        model_id=row.model_id,
        model_version=row.model_version or "1.0.0",
        is_graded=row.is_graded,
        result=row.result,
        actual_outcome=row.actual_outcome,
        profit_loss=row.profit_loss,
        clv=row.clv,
        home_team=row.home_team or "Unknown",
        away_team=row.away_team or "Unknown",
        game_date=row.game_date,
        shap_explanations=shap_explanations,
        closing_line=closing_line,
        closing_odds=closing_odds
    )


@router.get("/stats", response_model=PredictionStats)
async def get_prediction_stats(
    sport: Optional[str] = Query(None, description="Filter by sport code"),
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get prediction statistics and performance metrics.
    """
    cache_key = f"prediction_stats:{sport}:{days}"
    
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
    from_date = date.today() - timedelta(days=days)
    
    sport_condition = "AND sport_code = :sport" if sport else ""
    params = {"from_date": from_date}
    if sport:
        params["sport"] = sport
    
    # Overall stats
    stats_query = f"""
        SELECT 
            COUNT(*) as total_predictions,
            SUM(CASE WHEN is_graded THEN 1 ELSE 0 END) as graded_predictions,
            SUM(CASE WHEN NOT is_graded THEN 1 ELSE 0 END) as pending_predictions,
            AVG(CASE WHEN is_graded AND result = 'win' THEN 1.0 WHEN is_graded THEN 0.0 END) as win_rate,
            SUM(COALESCE(profit_loss, 0)) / NULLIF(COUNT(CASE WHEN is_graded THEN 1 END), 0) as roi,
            AVG(clv) as clv_average,
            SUM(CASE WHEN signal_tier = 'A' THEN 1 ELSE 0 END) as tier_a_count,
            AVG(CASE WHEN signal_tier = 'A' AND is_graded AND result = 'win' THEN 1.0 
                     WHEN signal_tier = 'A' AND is_graded THEN 0.0 END) as tier_a_win_rate,
            SUM(CASE WHEN signal_tier = 'B' THEN 1 ELSE 0 END) as tier_b_count,
            AVG(CASE WHEN signal_tier = 'B' AND is_graded AND result = 'win' THEN 1.0 
                     WHEN signal_tier = 'B' AND is_graded THEN 0.0 END) as tier_b_win_rate
        FROM predictions
        WHERE DATE(locked_at) >= :from_date {sport_condition}
    """
    
    result = await db.execute(stats_query, params)
    row = result.fetchone()
    
    # By sport breakdown
    sport_query = f"""
        SELECT 
            sport_code,
            COUNT(*) as total,
            AVG(CASE WHEN is_graded AND result = 'win' THEN 1.0 WHEN is_graded THEN 0.0 END) as win_rate,
            AVG(clv) as avg_clv
        FROM predictions
        WHERE DATE(locked_at) >= :from_date {sport_condition}
        GROUP BY sport_code
    """
    
    sport_result = await db.execute(sport_query, params)
    sport_rows = sport_result.fetchall()
    
    by_sport = {
        r.sport_code: {
            "total": r.total,
            "win_rate": round(r.win_rate * 100, 2) if r.win_rate else 0,
            "avg_clv": round(r.avg_clv, 4) if r.avg_clv else 0
        }
        for r in sport_rows
    }
    
    # By bet type breakdown
    bet_type_query = f"""
        SELECT 
            bet_type,
            COUNT(*) as total,
            AVG(CASE WHEN is_graded AND result = 'win' THEN 1.0 WHEN is_graded THEN 0.0 END) as win_rate,
            AVG(clv) as avg_clv
        FROM predictions
        WHERE DATE(locked_at) >= :from_date {sport_condition}
        GROUP BY bet_type
    """
    
    bet_result = await db.execute(bet_type_query, params)
    bet_rows = bet_result.fetchall()
    
    by_bet_type = {
        r.bet_type: {
            "total": r.total,
            "win_rate": round(r.win_rate * 100, 2) if r.win_rate else 0,
            "avg_clv": round(r.avg_clv, 4) if r.avg_clv else 0
        }
        for r in bet_rows
    }
    
    stats = PredictionStats(
        total_predictions=row.total_predictions or 0,
        graded_predictions=row.graded_predictions or 0,
        pending_predictions=row.pending_predictions or 0,
        win_rate=round((row.win_rate or 0) * 100, 2),
        roi=round((row.roi or 0) * 100, 2),
        clv_average=round(row.clv_average or 0, 4),
        tier_a_count=row.tier_a_count or 0,
        tier_a_win_rate=round((row.tier_a_win_rate or 0) * 100, 2),
        tier_b_count=row.tier_b_count or 0,
        tier_b_win_rate=round((row.tier_b_win_rate or 0) * 100, 2),
        by_sport=by_sport,
        by_bet_type=by_bet_type
    )
    
    # Cache for 5 minutes
    await cache_manager.set(cache_key, stats.dict(), ttl=300)
    
    return stats


@router.post("/generate", response_model=GeneratePredictionsResponse)
async def generate_predictions(
    request: GeneratePredictionsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate predictions for upcoming games and save them to the database.
    Requires admin role.
    """
    # Check if user has admin or system role
    user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
    if user_role not in ["admin", "super_admin", "system"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to generate predictions"
        )
    
    # Create prediction engine instance
    from app.services.ml.prediction_engine import create_advanced_prediction_engine
    prediction_engine = create_advanced_prediction_engine()
    
    # For now, return a stub response since full implementation requires game data fetching
    # TODO: Implement full prediction generation by fetching games and odds data
    try:
        # Stub implementation - return empty predictions for now
        result = {
            "predictions": [],
            "errors": ["Prediction generation not yet fully implemented. This endpoint is a placeholder."],
            "generated_count": 0
        }
        
        # Convert and save predictions to database
        saved_predictions = []
        saved_count = 0
        errors = result.get("errors", [])
        
        predictions_list = result.get("predictions", [])
        
        for pred_obj in predictions_list:
            try:
                # Handle both dataclass and dict objects
                if hasattr(pred_obj, 'to_dict'):
                    # It's a dataclass Prediction object
                    pred_data = pred_obj.to_dict()
                elif isinstance(pred_obj, dict):
                    # It's already a dictionary
                    pred_data = pred_obj
                else:
                    # Try to convert using dict() or get attributes
                    pred_data = dict(pred_obj) if hasattr(pred_obj, '__dict__') else {}
                
                # Extract values with fallbacks
                game_id_str = pred_data.get("game_id") or (getattr(pred_obj, 'game_id', None) if hasattr(pred_obj, 'game_id') else None)
                if not game_id_str:
                    errors.append(f"Missing game_id in prediction")
                    continue
                
                # Convert game_id to UUID
                try:
                    game_id = game_id_str if isinstance(game_id_str, UUID) else UUID(str(game_id_str))
                except (ValueError, AttributeError):
                    errors.append(f"Invalid game_id format: {game_id_str}")
                    continue
                
                # Get prediction hash
                pred_hash = pred_data.get("prediction_hash") or (getattr(pred_obj, 'prediction_hash', None) if hasattr(pred_obj, 'prediction_hash') else None)
                if not pred_hash:
                    errors.append(f"Missing prediction_hash for game {game_id_str}")
                    continue
                
                # Check if prediction already exists (by hash)
                existing = await db.execute(
                    select(DBPrediction).where(DBPrediction.prediction_hash == pred_hash)
                )
                if existing.scalar_one_or_none():
                    continue  # Skip if already exists
                
                # Extract bet_type and predicted_side (handle both .value for enums and direct strings)
                bet_type = pred_data.get("bet_type", "")
                if hasattr(bet_type, 'value'):
                    bet_type = bet_type.value
                
                predicted_side = pred_data.get("predicted_side", "")
                if hasattr(predicted_side, 'value'):
                    predicted_side = predicted_side.value
                
                # Get signal_tier
                signal_tier_val = pred_data.get("signal_tier") or (getattr(pred_obj, 'signal_tier', None) if hasattr(pred_obj, 'signal_tier') else "D")
                if hasattr(signal_tier_val, 'value'):
                    signal_tier_val = signal_tier_val.value
                signal_tier = SignalTier(signal_tier_val) if isinstance(signal_tier_val, str) else signal_tier_val
                
                # Get probability
                probability = pred_data.get("probability") or (getattr(pred_obj, 'probability', 0.0) if hasattr(pred_obj, 'probability') else 0.0)
                
                # Get recommendation data (for kelly_fraction and recommended_bet_size)
                recommendation = pred_data.get("recommendation", {})
                if hasattr(pred_obj, 'recommendation'):
                    rec_obj = pred_obj.recommendation
                    if hasattr(rec_obj, 'kelly_fraction'):
                        recommendation = {
                            'kelly_fraction': rec_obj.kelly_fraction,
                            'recommended_units': getattr(rec_obj, 'recommended_units', None)
                        }
                
                # Create database prediction model
                db_prediction = DBPrediction(
                    game_id=game_id,
                    bet_type=str(bet_type),
                    predicted_side=str(predicted_side),
                    probability=float(probability),
                    calibrated_probability=pred_data.get("calibrated_probability"),
                    line_at_prediction=pred_data.get("line_at_prediction") or pred_data.get("line") or (getattr(pred_obj, 'line', None) if hasattr(pred_obj, 'line') else None),
                    odds_at_prediction=pred_data.get("odds_at_prediction") or pred_data.get("odds") or (getattr(pred_obj, 'odds', None) if hasattr(pred_obj, 'odds') else None),
                    edge=pred_data.get("edge") or (getattr(pred_obj, 'edge', None) if hasattr(pred_obj, 'edge') else None),
                    signal_tier=signal_tier,
                    kelly_fraction=pred_data.get("kelly_fraction") or recommendation.get("kelly_fraction") if isinstance(recommendation, dict) else None,
                    recommended_bet_size=pred_data.get("recommended_bet_size") or recommendation.get("recommended_units") if isinstance(recommendation, dict) else None,
                    prediction_hash=str(pred_hash),
                    created_at=datetime.utcnow()
                )
                
                db.add(db_prediction)
                saved_predictions.append(pred_data if isinstance(pred_data, dict) else (pred_obj.to_dict() if hasattr(pred_obj, 'to_dict') else {}))
                saved_count += 1
                
            except Exception as e:
                # Log error but continue with other predictions
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error saving prediction to database: {e}", exc_info=True)
                errors.append(f"Error saving prediction: {str(e)}")
                continue
        
        # Commit all saved predictions
        if saved_count > 0:
            await db.commit()
        
        return GeneratePredictionsResponse(
            generated_count=saved_count,
            predictions=saved_predictions,
            errors=errors
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictions: {str(e)}"
        )


@router.post("/{prediction_id}/verify")
async def verify_prediction_integrity(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Verify the SHA-256 hash integrity of a prediction.
    """
    query = """
        SELECT 
            id, game_id, bet_type, predicted_side, probability,
            line_at_prediction, odds_at_prediction, locked_at, prediction_hash
        FROM predictions
        WHERE id = :prediction_id
    """
    
    result = await db.execute(query, {"prediction_id": prediction_id})
    row = result.fetchone()
    
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction {prediction_id} not found"
        )
    
    from app.core.security import SHA256Hasher
    
    # Reconstruct hash
    prediction_data = {
        "game_id": row.game_id,
        "bet_type": row.bet_type,
        "predicted_side": row.predicted_side,
        "probability": round(row.probability, 6),
        "line": row.line_at_prediction,
        "odds": row.odds_at_prediction,
        "timestamp": row.locked_at.isoformat()
    }
    
    computed_hash = SHA256Hasher.hash_prediction(prediction_data)
    is_valid = SHA256Hasher.verify_prediction(prediction_data, row.prediction_hash)
    
    return {
        "prediction_id": prediction_id,
        "stored_hash": row.prediction_hash,
        "computed_hash": computed_hash,
        "is_valid": is_valid,
        "verified_at": datetime.utcnow().isoformat()
    }


@router.post("/grade")
async def grade_predictions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Grade all pending predictions with completed games.
    Requires admin role.
    """
    if current_user.get("role") not in ["admin", "system"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to grade predictions"
        )
    
    from app.services.grading.auto_grader import auto_grader
    
    try:
        result = await auto_grader.grade_all_pending()
        
        return {
            "graded_count": result["graded_count"],
            "wins": result["wins"],
            "losses": result["losses"],
            "pushes": result["pushes"],
            "errors": result.get("errors", [])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to grade predictions: {str(e)}"
        )
