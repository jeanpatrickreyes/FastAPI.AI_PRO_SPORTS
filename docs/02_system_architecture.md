# System Architecture

## AI PRO SPORTS - Complete Architecture Specification

**Version 3.0 | January 2026**

---

## 1. High-Level Architecture Overview

AI PRO SPORTS follows a microservices-based architecture with clear separation of concerns, organized into five major component groups:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                               │
│   Web Dashboard │ Mobile App │ API Gateway │ CLI Tools                  │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                          SERVICE LAYER                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Predictions  │ │   Betting    │ │   Models     │ │   Admin      │   │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                         ML PIPELINE LAYER                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  H2O AutoML  │ │  AutoGluon   │ │   Sklearn    │ │Meta-Ensemble │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Calibration │ │     SHAP     │ │   ELO        │ │  Walk-Fwd    │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                         DATA LAYER                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  PostgreSQL  │ │    Redis     │ │Feature Store │ │  Data Lake   │   │
│  │   (OLTP)     │ │   (Cache)    │ │              │ │ (Analytics)  │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────┐
│                      DATA INGESTION LAYER                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ TheOddsAPI   │ │    ESPN      │ │   Weather    │ │   Injuries   │   │
│  │  Collector   │ │  Collector   │ │  Collector   │ │  Collector   │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Inventory

### 2.1 Data Collection Services (6)

| Service | Purpose | Refresh Rate | Data Source |
|---------|---------|--------------|-------------|
| odds_collector | Real-time odds from 40+ books | 60 seconds | TheOddsAPI |
| espn_collector | Schedules, scores, stats | 5 minutes | ESPN API |
| weather_collector | Game-time weather | 4 hours pre-game | Weather API |
| injury_collector | Player injury reports | 60 minutes | Injury feeds |
| tennis_collector | ATP/WTA rankings, H2H | Weekly | ATP/WTA Tour |
| historical_loader | Bulk historical data | On-demand | Multiple |

### 2.2 Data Pipeline Services (5)

| Service | Purpose |
|---------|---------|
| etl_manager | Coordinates ETL workflows |
| dag_orchestrator | Manages pipeline dependencies |
| star_schema_builder | Builds analytics warehouse |
| data_lake_manager | Manages data lake zones |
| pipeline_scheduler | Schedules batch jobs |

### 2.3 ML Services (15)

| Service | Purpose |
|---------|---------|
| h2o_trainer | H2O AutoML training |
| autogluon_trainer | AutoGluon stack training |
| sklearn_trainer | Sklearn ensemble training |
| meta_ensemble | Combines framework predictions |
| feature_engineering | Generates 1,070 features |
| calibration | Probability calibration |
| shap_explainer | SHAP value generation |
| elo_system | ELO rating calculations |
| prediction_engine | Inference and serving |
| model_registry | Model version management |
| model_versioning | Model lineage tracking |
| walk_forward_validator | Time-series validation |
| sport_features | Sport-specific features |
| performance_tracker | Accuracy monitoring |
| benchmark | Model comparison |

### 2.4 Betting Services (10)

| Service | Purpose |
|---------|---------|
| kelly_calculator | Optimal bet sizing |
| clv_tracker | Closing line value tracking |
| auto_grader | Prediction result grading |
| bankroll_manager | Bankroll tracking |
| bet_tracker | Bet history management |
| value_bet_finder | Value opportunity detection |
| steam_detector | Sharp action detection |
| line_shopping | Best odds finder |
| arbitrage_detector | Arbitrage opportunities |
| player_props_service | Player prop predictions |

### 2.5 Monitoring Services (6)

| Service | Purpose |
|---------|---------|
| health_checker | Component health monitoring |
| alerting | Multi-channel notifications |
| metrics | Prometheus metric collection |
| dashboard_service | Dashboard data preparation |
| data_monitoring | Data quality monitoring |
| report_generator | Performance reports |

### 2.6 Self-Healing Services (4)

| Service | Purpose |
|---------|---------|
| watchdog | System health surveillance |
| anomaly_detector | Anomaly detection |
| auto_recovery | Automated recovery actions |
| circuit_breaker | Failure isolation |

---

## 3. Data Flow Narratives

### 3.1 Prediction Generation Flow

1. **API Request**: User or system requests prediction for game
2. **Feature Retrieval**: Feature service retrieves from feature store (Redis cache)
3. **Feature Generation**: If not cached, real-time feature computation
4. **Model Loading**: Prediction engine loads production models
5. **Multi-Framework Inference**: H2O, AutoGluon, sklearn models predict
6. **Meta-Ensemble**: Weighted combination of predictions
7. **Calibration**: Isotonic regression calibration applied
8. **Signal Classification**: Tier A/B/C/D assignment
9. **Kelly Calculation**: Optimal bet size computed
10. **SHAP Explanation**: Top-10 feature contributions
11. **Hash Generation**: SHA-256 prediction lock-in
12. **Response**: Cached and returned to client

**Latency Target**: <5 seconds end-to-end

### 3.2 Data Collection Flow

1. **Scheduled Trigger**: Collector service activated by scheduler
2. **API Request**: External API called with rate limit handling
3. **Response Parsing**: JSON parsed into structured records
4. **Validation**: Schema, range, and null checks applied
5. **Movement Detection**: Line changes identified
6. **Database Insert**: Records upserted to PostgreSQL
7. **Cache Update**: Redis cache refreshed
8. **Event Emission**: Downstream services notified

**Collection Schedule**:
- Odds: Every 60 seconds
- Schedules: Every 5 minutes
- Scores: Every 15 minutes during games
- Weather: 4 hours before game time
- Injuries: Every 60 minutes

### 3.3 Model Training Flow

1. **Data Extraction**: Historical data with walk-forward splits
2. **Feature Engineering**: 60-150 features per sport generated
3. **H2O Training**: AutoML trains up to 50 models
4. **AutoGluon Training**: Multi-layer stack ensemble
5. **Sklearn Training**: XGBoost/LightGBM/CatBoost/RF
6. **Validation**: Metrics computed for each framework
7. **Meta-Weight Optimization**: Ensemble weights optimized
8. **Calibrator Training**: Isotonic regression on holdout
9. **Model Registration**: Versioned models stored
10. **Champion/Challenger**: Comparison with production model
11. **Promotion Decision**: If challenger wins, promote
12. **Report Generation**: Training report distributed

**Training Schedule**: Weekly full retrain, daily incremental updates

---

## 4. Technology Stack

### 4.1 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Primary language |
| FastAPI | Latest | Async API framework |
| SQLAlchemy | 2.0 | ORM with async |
| PostgreSQL | 15+ | Primary database |
| Redis | 7+ | Caching and sessions |
| Alembic | Latest | Database migrations |
| Pydantic | 2.0 | Data validation |

### 4.2 Machine Learning

| Technology | Purpose |
|------------|---------|
| H2O AutoML | Automated ML with 50+ models |
| AutoGluon | Multi-layer stack ensembling |
| XGBoost | Gradient boosting |
| LightGBM | Fast gradient boosting |
| CatBoost | Categorical features |
| scikit-learn | ML utilities |
| SHAP | Model explainability |
| pandas/numpy | Data manipulation |

### 4.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Reverse proxy, SSL |
| Uvicorn | ASGI server |
| APScheduler | Background tasks |
| Prometheus | Metrics collection |
| Grafana | Dashboards |

---

## 5. Server Specifications

### Target Server: Hetzner GEX131

| Component | Specification |
|-----------|---------------|
| GPU | NVIDIA RTX PRO 6000 (96GB VRAM) |
| CPU | 24-core Intel Xeon |
| RAM | 512GB DDR4 |
| Storage | 2TB NVMe SSD |
| Network | 1 Gbps unmetered |
| Cost | ~$1,534/month |

### Resource Allocation

| Component | Typical Usage |
|-----------|---------------|
| GPU | AutoGluon training, neural network inference |
| CPU | H2O AutoML, feature engineering, API serving |
| RAM | Large dataset processing, model caching |
| Storage | Historical data, trained models, logs |

---

**AI PRO SPORTS - System Architecture**

*Version 3.0 | January 2026*
