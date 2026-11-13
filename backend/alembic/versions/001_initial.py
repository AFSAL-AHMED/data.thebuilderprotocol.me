"""Initial migration - create all tables

Revision ID: 001
Revises:
Create Date: 2026-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('bio', sa.Text, nullable=True),
        sa.Column('organisation', sa.String(255), nullable=True),
        sa.Column('areas_of_interest', sa.JSON, nullable=True),
        sa.Column('role', sa.Enum('contributor', 'admin', name='userrole'), nullable=False, server_default='contributor'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_email_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Datasets table
    op.create_table(
        'datasets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('slug', sa.String(600), nullable=False),
        sa.Column('short_description', sa.String(1000), nullable=False),
        sa.Column('full_description', sa.Text, nullable=False),
        sa.Column('contributor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.Enum('ai_ml', 'nlp', 'computer_vision', 'scientific_research',
                                      'climate_environment', 'geospatial', 'software_engineering',
                                      'public_data', 'language_culture', 'other', name='datasetcategory'), nullable=False),
        sa.Column('tags', sa.JSON, nullable=True),
        sa.Column('source_url', sa.String(1000), nullable=False),
        sa.Column('download_url', sa.String(1000), nullable=True),
        sa.Column('file_format', sa.JSON, nullable=True),
        sa.Column('licence', sa.Enum('cc0', 'cc_by', 'cc_by_sa', 'cc_by_nc', 'apache_2', 'mit',
                                     'proprietary', 'other', name='datasetlicence'), nullable=False),
        sa.Column('language', sa.JSON, nullable=True),
        sa.Column('collection_method', sa.Text, nullable=True),
        sa.Column('intended_use', sa.Text, nullable=True),
        sa.Column('known_limitations', sa.Text, nullable=True),
        sa.Column('citation_info', sa.Text, nullable=True),
        sa.Column('status', sa.Enum('pending', 'approved', 'rejected', 'correction_requested', name='datasetstatus'), nullable=False, server_default='pending'),
        sa.Column('rejection_reason', sa.Text, nullable=True),
        sa.Column('review_notes', sa.Text, nullable=True),
        sa.Column('is_sample_data', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('num_records', sa.Integer, nullable=True),
        sa.Column('num_columns', sa.Integer, nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger, nullable=True),
        sa.Column('quality_report', sa.JSON, nullable=True),
        sa.Column('quality_source', sa.Enum('contributor_provided', 'auto_calculated', 'human_reviewed', name='qualitysource'), nullable=True),
        sa.Column('geographic_coverage', sa.String(500), nullable=True),
        sa.Column('version', sa.String(50), nullable=False, server_default='1.0'),
        sa.Column('view_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('download_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('published_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['contributor_id'], ['users.id']),
    )
    op.create_index('ix_datasets_slug', 'datasets', ['slug'], unique=True)
    op.create_index('ix_datasets_contributor_id', 'datasets', ['contributor_id'])

    # Collections table
    op.create_table(
        'collections',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('slug', sa.String(600), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('curator_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_featured', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('dataset_ids', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['curator_id'], ['users.id']),
    )
    op.create_index('ix_collections_slug', 'collections', ['slug'], unique=True)

    # Issue reports table
    op.create_table(
        'issue_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('dataset_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reporter_email', sa.String(255), nullable=True),
        sa.Column('issue_type', sa.Enum('broken_link', 'incorrect_metadata', 'licensing_problem',
                                        'data_quality', 'privacy_concern', 'other', name='issuetype'), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('status', sa.Enum('open', 'under_review', 'resolved', 'dismissed', name='issuestatus'), nullable=False, server_default='open'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['dataset_id'], ['datasets.id']),
        sa.ForeignKeyConstraint(['reporter_id'], ['users.id']),
    )
    op.create_index('ix_issue_reports_dataset_id', 'issue_reports', ['dataset_id'])

    # Activity logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.String(255), nullable=False),
        sa.Column('entity_type', sa.String(100), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('metadata', sa.JSON, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_activity_logs_user_id', 'activity_logs', ['user_id'])


def downgrade() -> None:
    op.drop_table('activity_logs')
    op.drop_table('issue_reports')
    op.drop_table('collections')
    op.drop_table('datasets')
    op.drop_table('users')
    for enum_name in ['userrole', 'datasetcategory', 'datasetlicence', 'datasetstatus',
                      'qualitysource', 'issuetype', 'issuestatus']:
        op.execute(f'DROP TYPE IF EXISTS {enum_name}')
