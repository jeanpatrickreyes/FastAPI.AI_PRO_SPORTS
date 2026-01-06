"""
AI PRO SPORTS - Predictions API Routes
Enterprise-grade predictions endpoints with filtering, pagination, and SHAP explanations
"""

from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.core.cache import cache_manager


router = APIRouter(tags=["predictions"])


# ============================================================================
# SCHEMAS
# ============================================================================

class SHAPExplanation(BaseModel):
    feature: str
    value: float
    impact: str  # positive or negative


class PredictionBase(BaseModel):
    id: int
    game_id: int
    sport_code: str
    bet_type: str  # spread, moneyline, total
    predicted_side: str
    probability: float
    edge: float
    signal_tier: str  # A, B, C, D
    line_at_prediction: Optional[float] = None
    odds_at_prediction: Optional[int] = None
    kelly_fraction: Optional[float] = None
    recommended_bet: Optional[float] = None
    prediction_hash: str
    locked_at: datetime
    model_id: int
    model_version: str
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
    
    # Build query conditions
    conditions = []
    
    if sport:
        conditions.append("sport_code = :sport")
    if bet_type:
        conditions.append("bet_type = :bet_type")
    if signal_tier:
        conditions.append("signal_tier = :signal_tier")
    if is_graded is not None:
        conditions.append("is_graded = :is_graded")
    if result:
        conditions.append("result = :result")
    if date_from:
        conditions.append("DATE(locked_at) >= :date_from")
    if date_to:
        conditions.append("DATE(locked_at) <= :date_to")
    if min_probability:
        conditions.append("probability >= :min_probability")
    if min_edge:
        conditions.append("edge >= :min_edge")
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    # Count total
    count_query = f"SELECT COUNT(*) FROM predictions WHERE {where_clause}"
    params = {
        "sport": sport,
        "bet_type": bet_type,
        "signal_tier": signal_tier,
        "is_graded": is_graded,
        "result": result,
        "date_from": date_from,
        "date_to": date_to,
        "min_probability": min_probability,
        "min_edge": min_edge
    }
    
    count_result = await db.execute(count_query, {k: v for k, v in params.items() if v is not None})
    total = count_result.scalar() or 0
    
    # Get paginated results
    offset = (page - 1) * per_page
    data_query = f"""
        SELECT 
            p.*,
            m.version as model_version
        FROM predictions p
        LEFT JOIN ml_models m ON p.model_id = m.id
        WHERE {where_clause}
        ORDER BY p.locked_at DESC
        LIMIT :limit OFFSET :offset
    """
    
    params["limit"] = per_page
    params["offset"] = offset
    
    result = await db.execute(data_query, {k: v for k, v in params.items() if v is not None})
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
    current_user: dict = Depends(get_current_user)
):
    """
    Get today's predictions with optional sport and tier filtering.
    """
    cache_key = f"predictions:today:{sport}:{signal_tier}"
    
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached
    
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
    current_user: dict = Depends(get_current_user)
):
    """
    Generate predictions for upcoming games.
    Requires admin role.
    """
    if current_user.get("role") not in ["admin", "system"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to generate predictions"
        )
    
    from app.services.ml.prediction_engine import prediction_engine
    
    try:
        result = await prediction_engine.generate_predictions(
            sport_code=request.sport_code,
            game_ids=request.game_ids,
            bet_types=request.bet_types
        )
        
        return GeneratePredictionsResponse(
            generated_count=result["generated_count"],
            predictions=result["predictions"],
            errors=result.get("errors", [])
        )
    except Exception as e:
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
