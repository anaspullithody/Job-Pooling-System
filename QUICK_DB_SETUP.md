# Quick Database Setup Guide

## Option 1: Run the Setup Script (Easiest)

```bash
./setup-database.sh
```

You'll be prompted for your PostgreSQL password. The script will:
- Create the `job_portal` database
- Create a `job_user` with password `job_portal_2024`
- Grant all necessary permissions

## Option 2: Manual Setup via psql

1. Connect to PostgreSQL:
```bash
/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $(whoami) -d postgres
```

2. Run these SQL commands:
```sql
CREATE DATABASE job_portal;
CREATE USER job_user WITH PASSWORD 'job_portal_2024';
GRANT ALL PRIVILEGES ON DATABASE job_portal TO job_user;
\c job_portal
GRANT ALL ON SCHEMA public TO job_user;
\q
```

## Option 3: Use Your Current User (No Password)

If you want to use your current macOS user without a password:

1. Update `.env.local`:
```env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/job_portal?schema=public"
```

2. Create database:
```bash
/opt/homebrew/opt/postgresql@16/bin/createdb -h localhost job_portal
```

## After Setup

1. Update `.env.local` with the connection string:
```env
DATABASE_URL="postgresql://job_user:job_portal_2024@localhost:5432/job_portal?schema=public"
```

2. Run migrations:
```bash
npm run db:migrate
npm run db:seed
```

## Troubleshooting

**If you forgot your PostgreSQL password:**
- Reset it: `/opt/homebrew/opt/postgresql@16/bin/psql -h localhost -U $(whoami) -d postgres -c "ALTER USER $(whoami) WITH PASSWORD 'newpassword';"`

**If connection fails:**
- Check if PostgreSQL is running: `brew services list | grep postgresql`
- Start it: `brew services start postgresql@16`

