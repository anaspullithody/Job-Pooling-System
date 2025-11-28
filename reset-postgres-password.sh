#!/bin/bash

# Script to reset PostgreSQL password and create database

echo "=== PostgreSQL Setup for Job Portal ==="
echo ""
echo "This script will help you set up PostgreSQL."
echo ""

# Option 1: Try to connect without password (peer auth)
echo "Attempting to connect using peer authentication..."
/opt/homebrew/opt/postgresql@16/bin/psql -d postgres <<EOF
-- Reset password for current user
ALTER USER $(whoami) WITH PASSWORD 'postgres123';

-- Create database
CREATE DATABASE job_portal;

-- Create application user
CREATE USER job_user WITH PASSWORD 'job_portal_2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE job_portal TO job_user;

-- Connect to job_portal and grant schema privileges
\c job_portal
GRANT ALL ON SCHEMA public TO job_user;

\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup successful!"
    echo ""
    echo "Your PostgreSQL password for user '$(whoami)' is now: postgres123"
    echo ""
    echo "Update your .env.local with:"
    echo "DATABASE_URL=\"postgresql://job_user:job_portal_2024@localhost:5432/job_portal?schema=public\""
    echo ""
else
    echo ""
    echo "❌ Could not connect automatically."
    echo ""
    echo "Please run these commands manually:"
    echo ""
    echo "1. Connect to PostgreSQL:"
    echo "   /opt/homebrew/opt/postgresql@16/bin/psql -d postgres"
    echo ""
    echo "2. Then run these SQL commands:"
    echo "   ALTER USER $(whoami) WITH PASSWORD 'postgres123';"
    echo "   CREATE DATABASE job_portal;"
    echo "   CREATE USER job_user WITH PASSWORD 'job_portal_2024';"
    echo "   GRANT ALL PRIVILEGES ON DATABASE job_portal TO job_user;"
    echo "   \\c job_portal"
    echo "   GRANT ALL ON SCHEMA public TO job_user;"
    echo "   \\q"
    echo ""
fi

