#!/bin/bash

# PostgreSQL Database Setup Script
# Run this script to create the database and user

echo "Setting up PostgreSQL database for Job Portal..."

# Get the current username
CURRENT_USER=$(whoami)

# Database credentials
DB_NAME="job_portal"
DB_USER="job_user"
DB_PASSWORD="job_portal_2024"

echo ""
echo "You'll need to enter your PostgreSQL password (for user: $CURRENT_USER)"
echo "If you don't have a password set, you can press Enter or set one first"
echo ""

# Create database
echo "Creating database: $DB_NAME"
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $CURRENT_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>&1

# Create user (ignore error if user already exists)
echo "Creating user: $DB_USER"
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $CURRENT_USER -d postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>&1 || echo "User might already exist, continuing..."

# Grant privileges
echo "Granting privileges..."
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $CURRENT_USER -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>&1

# Grant schema privileges
echo "Granting schema privileges..."
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $CURRENT_USER -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>&1

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Update your .env.local file with:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public\""
echo ""


