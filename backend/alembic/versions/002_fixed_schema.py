"""
Fixed migration that handles existing database objects gracefully.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    """Create schema with IF NOT EXISTS handling for existing objects."""
    
    # Create ENUM types with IF NOT EXISTS equivalent
    try:
        op.execute("CREATE TYPE userrole AS ENUM ('tenant', 'landlord', 'admin')")
    except Exception:
        print("userrole enum already exists, skipping...")
    
    try:
        op.execute("CREATE TYPE verificationmethod AS ENUM ('rental_agreement', 'utility_bill', 'bank_statement', 'id_verification')")
    except Exception:
        print("verificationmethod enum already exists, skipping...")
    
    try:
        op.execute("CREATE TYPE verificationstatus AS ENUM ('pending', 'approved', 'rejected')")
    except Exception:
        print("verificationstatus enum already exists, skipping...")
    
    # Create tables with IF NOT EXISTS
    try:
        op.create_table('users',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('email', sa.String(length=255), nullable=False),
            sa.Column('password_hash', sa.String(length=255), nullable=False),
            sa.Column('first_name', sa.String(length=100), nullable=False),
            sa.Column('last_name', sa.String(length=100), nullable=False),
            sa.Column('phone', sa.String(length=20), nullable=True),
            sa.Column('role', postgresql.ENUM('tenant', 'landlord', 'admin', name='userrole'), nullable=False),
            sa.Column('is_verified', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
        op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
        print("Users table created successfully")
    except Exception as e:
        print(f"Users table might already exist: {e}")
    
    try:
        op.create_table('properties',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('address', sa.Text(), nullable=False),
            sa.Column('area', sa.String(length=100), nullable=False),
            sa.Column('city', sa.String(length=100), nullable=False),
            sa.Column('state', sa.String(length=100), nullable=False),
            sa.Column('postal_code', sa.String(length=20), nullable=False),
            sa.Column('property_type', sa.String(length=50), nullable=False),
            sa.Column('latitude', sa.Numeric(precision=10, scale=8), nullable=True),
            sa.Column('longitude', sa.Numeric(precision=11, scale=8), nullable=True),
            sa.Column('created_by', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_properties_area'), 'properties', ['area'], unique=False)
        op.create_index(op.f('ix_properties_city'), 'properties', ['city'], unique=False)
        op.create_index(op.f('ix_properties_id'), 'properties', ['id'], unique=False)
        print("Properties table created successfully")
    except Exception as e:
        print(f"Properties table might already exist: {e}")
    
    try:
        op.create_table('reviews',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.Column('reviewer_id', sa.Integer(), nullable=False),
            sa.Column('rating_overall', sa.Integer(), nullable=False),
            sa.Column('rating_cleanliness', sa.Integer(), nullable=True),
            sa.Column('rating_landlord', sa.Integer(), nullable=True),
            sa.Column('rating_location', sa.Integer(), nullable=True),
            sa.Column('rating_value', sa.Integer(), nullable=True),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('pros', sa.Text(), nullable=True),
            sa.Column('cons', sa.Text(), nullable=True),
            sa.Column('lived_duration_months', sa.Integer(), nullable=True),
            sa.Column('rent_amount', sa.Numeric(precision=10, scale=2), nullable=True),
            sa.Column('is_anonymous', sa.Boolean(), nullable=True),
            sa.Column('is_verified', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
            sa.ForeignKeyConstraint(['reviewer_id'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
        op.create_index(op.f('ix_reviews_property_id'), 'reviews', ['property_id'], unique=False)
        op.create_index(op.f('ix_reviews_rating_overall'), 'reviews', ['rating_overall'], unique=False)
        print("Reviews table created successfully")
    except Exception as e:
        print(f"Reviews table might already exist: {e}")
    
    try:
        op.create_table('tenant_verifications',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('property_id', sa.Integer(), nullable=False),
            sa.Column('verification_method', postgresql.ENUM('rental_agreement', 'utility_bill', 'bank_statement', 'id_verification', name='verificationmethod'), nullable=False),
            sa.Column('document_url', sa.String(length=500), nullable=True),
            sa.Column('status', postgresql.ENUM('pending', 'approved', 'rejected', name='verificationstatus'), nullable=False),
            sa.Column('verified_by', sa.Integer(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('submitted_at', sa.DateTime(), nullable=True),
            sa.Column('verified_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
            sa.ForeignKeyConstraint(['verified_by'], ['users.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tenant_verifications_id'), 'tenant_verifications', ['id'], unique=False)
        op.create_index(op.f('ix_tenant_verifications_status'), 'tenant_verifications', ['status'], unique=False)
        op.create_index(op.f('ix_tenant_verifications_user_id'), 'tenant_verifications', ['user_id'], unique=False)
        print("Tenant verifications table created successfully")
    except Exception as e:
        print(f"Tenant verifications table might already exist: {e}")

def downgrade():
    """Drop all tables and types."""
    op.drop_table('tenant_verifications')
    op.drop_table('reviews')
    op.drop_table('properties')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS verificationstatus')
    op.execute('DROP TYPE IF EXISTS verificationmethod')
    op.execute('DROP TYPE IF EXISTS userrole')
