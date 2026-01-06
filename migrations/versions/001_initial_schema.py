"""Initial Phase 1 schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-12-01

AI PRO SPORTS - Phase 1 Database Schema
Complete table structure for core data platform.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('username', sa.String(100), unique=True, nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('two_factor_secret', sa.String(255), nullable=True),
        sa.Column('profile', postgresql.JSONB(), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Sessions table
    op.create_table(
        'sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('token_hash', sa.String(255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # API Keys table
    op.create_table(
        'api_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('key_hash', sa.String(255), nullable=False, unique=True),
        sa.Column('key_prefix', sa.String(10), nullable=False),
        sa.Column('permissions', postgresql.JSONB(), nullable=True),
        sa.Column('rate_limit', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Sports table
    op.create_table(
        'sports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('code', sa.String(10), unique=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('api_key', sa.String(100), nullable=True),
        sa.Column('feature_count', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('config', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Teams table
    op.create_table(
        'teams',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('sport_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('external_id', sa.String(50), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('abbreviation', sa.String(10), nullable=True),
        sa.Column('elo_rating', sa.Float(), nullable=False, server_default='1500.0'),
        sa.Column('conference', sa.String(100), nullable=True),
        sa.Column('division', sa.String(100), nullable=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_teams_sport_external', 'teams', ['sport_id', 'external_id'], unique=True)
    
    # Players table
    op.create_table(
        'players',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teams.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('external_id', sa.String(50), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('position', sa.String(50), nullable=True),
        sa.Column('jersey_number', sa.Integer(), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Venues table
    op.create_table(
        'venues',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('external_id', sa.String(50), nullable=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('surface_type', sa.String(50), nullable=True),
        sa.Column('is_dome', sa.Boolean(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('timezone', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Seasons table
    op.create_table(
        'seasons',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('sport_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sports.id', ondelete='CASCADE'), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_seasons_sport_year', 'seasons', ['sport_id', 'year'], unique=True)
    
    # Games table
    op.create_table(
        'games',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('sport_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('season_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('seasons.id', ondelete='SET NULL'), nullable=True),
        sa.Column('external_id', sa.String(50), nullable=True),
        sa.Column('home_team_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('away_team_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('venues.id', ondelete='SET NULL'), nullable=True),
        sa.Column('game_date', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='scheduled'),
        sa.Column('home_score', sa.Integer(), nullable=True),
        sa.Column('away_score', sa.Integer(), nullable=True),
        sa.Column('is_overtime', sa.Boolean(), nullable=True),
        sa.Column('period_scores', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_games_sport_external', 'games', ['sport_id', 'external_id'], unique=True)
    
    # Sportsbooks table
    op.create_table(
        'sportsbooks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('api_key', sa.String(100), nullable=True),
        sa.Column('is_sharp', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('vig_estimate', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Odds table
    op.create_table(
        'odds',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('games.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('sportsbook_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sportsbooks.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('market_type', sa.String(20), nullable=False),
        sa.Column('selection', sa.String(20), nullable=False),
        sa.Column('price', sa.Integer(), nullable=False),
        sa.Column('line', sa.Float(), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )
    op.create_index('ix_odds_game_market', 'odds', ['game_id', 'market_type', 'sportsbook_id'])
    
    # Odds Movements table
    op.create_table(
        'odds_movements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('odds_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('odds.id', ondelete='CASCADE'), nullable=False),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('games.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('old_line', sa.Float(), nullable=True),
        sa.Column('new_line', sa.Float(), nullable=True),
        sa.Column('old_price', sa.Integer(), nullable=True),
        sa.Column('new_price', sa.Integer(), nullable=True),
        sa.Column('movement_size', sa.Float(), nullable=True),
        sa.Column('detected_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Closing Lines table
    op.create_table(
        'closing_lines',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('games.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('sportsbook_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sportsbooks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('market_type', sa.String(20), nullable=False),
        sa.Column('home_line', sa.Float(), nullable=True),
        sa.Column('away_line', sa.Float(), nullable=True),
        sa.Column('total_line', sa.Float(), nullable=True),
        sa.Column('home_price', sa.Integer(), nullable=True),
        sa.Column('away_price', sa.Integer(), nullable=True),
        sa.Column('over_price', sa.Integer(), nullable=True),
        sa.Column('under_price', sa.Integer(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # ML Models table
    op.create_table(
        'ml_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('sport_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sports.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('bet_type', sa.String(20), nullable=False),
        sa.Column('framework', sa.String(20), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=True),
        sa.Column('is_production', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('performance_metrics', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Predictions table
    op.create_table(
        'predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('games.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('model_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('ml_models.id', ondelete='SET NULL'), nullable=True),
        sa.Column('bet_type', sa.String(20), nullable=False),
        sa.Column('predicted_side', sa.String(20), nullable=False),
        sa.Column('probability', sa.Float(), nullable=False),
        sa.Column('edge', sa.Float(), nullable=True),
        sa.Column('signal_tier', sa.String(1), nullable=True),
        sa.Column('kelly_fraction', sa.Float(), nullable=True),
        sa.Column('line_at_prediction', sa.Float(), nullable=True),
        sa.Column('odds_at_prediction', sa.Integer(), nullable=True),
        sa.Column('prediction_hash', sa.String(64), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )
    
    # Prediction Results table
    op.create_table(
        'prediction_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('prediction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('predictions.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('actual_result', sa.String(10), nullable=False),
        sa.Column('profit_loss', sa.Numeric(12, 2), nullable=True),
        sa.Column('clv', sa.Float(), nullable=True),
        sa.Column('closing_line', sa.Float(), nullable=True),
        sa.Column('graded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Bankrolls table
    op.create_table(
        'bankrolls',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('initial_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('current_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('peak_amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('low_amount', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(3), nullable=False, server_default='USD'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Bets table
    op.create_table(
        'bets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('bankroll_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('bankrolls.id', ondelete='SET NULL'), nullable=True),
        sa.Column('prediction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('predictions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('game_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('games.id', ondelete='SET NULL'), nullable=True),
        sa.Column('stake', sa.Numeric(12, 2), nullable=False),
        sa.Column('odds', sa.Integer(), nullable=False),
        sa.Column('bet_type', sa.String(20), nullable=False),
        sa.Column('selection', sa.String(50), nullable=False),
        sa.Column('line', sa.Float(), nullable=True),
        sa.Column('sportsbook', sa.String(100), nullable=True),
        sa.Column('result', sa.String(10), nullable=True),
        sa.Column('profit_loss', sa.Numeric(12, 2), nullable=True),
        sa.Column('placed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('settled_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # Alerts table
    op.create_table(
        'alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('alert_type', sa.String(50), nullable=False),
        sa.Column('severity', sa.String(20), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('details', postgresql.JSONB(), nullable=True),
        sa.Column('is_acknowledged', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('acknowledged_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )
    
    # Scheduled Tasks table
    op.create_table(
        'scheduled_tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('task_name', sa.String(100), nullable=False, unique=True),
        sa.Column('cron_expression', sa.String(100), nullable=False),
        sa.Column('is_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('status', sa.String(20), nullable=False, server_default='idle'),
        sa.Column('last_run_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_run_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Data Quality Checks table
    op.create_table(
        'data_quality_checks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('check_type', sa.String(50), nullable=False),
        sa.Column('source', sa.String(50), nullable=True),
        sa.Column('passed', sa.Boolean(), nullable=False),
        sa.Column('failed_count', sa.Integer(), nullable=True),
        sa.Column('details', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # System Health Snapshots table
    op.create_table(
        'system_health_snapshots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('component', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('metrics', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('system_health_snapshots')
    op.drop_table('data_quality_checks')
    op.drop_table('scheduled_tasks')
    op.drop_table('alerts')
    op.drop_table('bets')
    op.drop_table('bankrolls')
    op.drop_table('prediction_results')
    op.drop_table('predictions')
    op.drop_table('ml_models')
    op.drop_table('closing_lines')
    op.drop_table('odds_movements')
    op.drop_table('odds')
    op.drop_table('sportsbooks')
    op.drop_table('games')
    op.drop_table('seasons')
    op.drop_table('venues')
    op.drop_table('players')
    op.drop_table('teams')
    op.drop_table('sports')
    op.drop_table('api_keys')
    op.drop_table('sessions')
    op.drop_table('users')
