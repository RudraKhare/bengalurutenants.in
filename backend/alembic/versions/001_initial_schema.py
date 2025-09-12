"""Initial database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2025-09-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema for Bengaluru Tenants platform."""
    
    # Create ENUM types
    op.execute("CREATE TYPE userrole AS ENUM ('tenant', 'landlord', 'admin')")
    op.execute("CREATE TYPE verificationmethod AS ENUM ('rental_agreement', 'utility_bill', 'upi_transaction', 'bank_statement', 'photos')")
    op.execute("CREATE TYPE verificationstatus AS ENUM ('pending', 'verified', 'rejected')")
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('is_email_verified', sa.Boolean(), nullable=True),
        sa.Column('role', sa.Enum('tenant', 'landlord', 'admin', name='userrole'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Create properties table
    op.create_table(
        'properties',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('area', sa.String(length=100), nullable=False),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lng', sa.Float(), nullable=True),
        sa.Column('avg_rating', sa.Float(), nullable=True),
        sa.Column('review_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_properties_id'), 'properties', ['id'], unique=False)
    op.create_index(op.f('ix_properties_city'), 'properties', ['city'], unique=False)
    op.create_index(op.f('ix_properties_area'), 'properties', ['area'], unique=False)
    
    # Create reviews table
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('verification_level', sa.String(length=20), nullable=True),
        sa.Column('upvotes', sa.Integer(), nullable=True),
        sa.Column('downvotes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    
    # Create tenant_verifications table
    op.create_table(
        'tenant_verifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('review_id', sa.Integer(), nullable=True),
        sa.Column('method', sa.Enum('rental_agreement', 'utility_bill', 'upi_transaction', 'bank_statement', 'photos', name='verificationmethod'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'verified', 'rejected', name='verificationstatus'), nullable=True),
        sa.Column('proof_url', sa.String(length=500), nullable=True),
        sa.Column('upi_txn_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
        sa.ForeignKeyConstraint(['review_id'], ['reviews.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tenant_verifications_id'), 'tenant_verifications', ['id'], unique=False)
    
    # Set default values for existing columns
    op.execute("ALTER TABLE users ALTER COLUMN is_email_verified SET DEFAULT false")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'tenant'")
    op.execute("ALTER TABLE properties ALTER COLUMN avg_rating SET DEFAULT 0.0")
    op.execute("ALTER TABLE properties ALTER COLUMN review_count SET DEFAULT 0")
    op.execute("ALTER TABLE reviews ALTER COLUMN verification_level SET DEFAULT 'unverified'")
    op.execute("ALTER TABLE reviews ALTER COLUMN upvotes SET DEFAULT 0")
    op.execute("ALTER TABLE reviews ALTER COLUMN downvotes SET DEFAULT 0")
    op.execute("ALTER TABLE tenant_verifications ALTER COLUMN status SET DEFAULT 'pending'")
    
    # Add performance indexes
    op.create_index('idx_reviews_property_rating', 'reviews', ['property_id', 'rating'])
    op.create_index('idx_reviews_verification', 'reviews', ['verification_level', 'created_at'])
    op.create_index('idx_properties_location', 'properties', ['city', 'area'])
    op.create_index('idx_user_reviews_date', 'reviews', ['user_id', 'created_at'])


def downgrade() -> None:
    """Drop all tables and types."""
    
    # Drop indexes
    op.drop_index('idx_user_reviews_date', table_name='reviews')
    op.drop_index('idx_properties_location', table_name='properties')
    op.drop_index('idx_reviews_verification', table_name='reviews')
    op.drop_index('idx_reviews_property_rating', table_name='reviews')
    
    # Drop tables
    op.drop_table('tenant_verifications')
    op.drop_table('reviews')
    op.drop_table('properties')
    op.drop_table('users')
    
    # Drop ENUM types
    op.execute("DROP TYPE IF EXISTS verificationstatus")
    op.execute("DROP TYPE IF EXISTS verificationmethod")
    op.execute("DROP TYPE IF EXISTS userrole")
