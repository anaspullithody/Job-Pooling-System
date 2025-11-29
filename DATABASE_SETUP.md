# Database Setup Guide (Without Docker)

## Option 1: Install PostgreSQL via Homebrew (Recommended for macOS)

### Step 1: Install PostgreSQL

```bash
brew install postgresql@16
```

Or for the latest version:
```bash
brew install postgresql
```

### Step 2: Start PostgreSQL Service

```bash
brew services start postgresql@16
```

Or if you installed the latest version:
```bash
brew services start postgresql
```

### Step 3: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# In the PostgreSQL prompt, create database and user:
CREATE DATABASE job_portal;
CREATE USER job_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE job_portal TO job_user;
\q
```

### Step 4: Update .env.local

Update your `.env.local` file with:

```env
DATABASE_URL="postgresql://job_user:your_secure_password@localhost:5432/job_portal?schema=public"
```

### Step 5: Run Migrations

```bash
npm run db:migrate
npm run db:seed
```

---

## Option 2: Use Cloud Database (Free Tier)

### Option 2a: Supabase (Free PostgreSQL)

1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Copy the connection string from Settings > Database
5. Update your `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Option 2b: Neon (Free PostgreSQL)

1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update your `.env.local` with the connection string

### Option 2c: Railway (Free Tier)

1. Go to https://railway.app
2. Create a free account
3. Create a new PostgreSQL database
4. Copy the connection string
5. Update your `.env.local`

---

## Option 3: Use SQLite for Development (Simplest, but not production-ready)

If you want the simplest setup for development only:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env.local`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

**Note**: SQLite has limitations and is not recommended for production. Use PostgreSQL for production.

---

## Quick Start Commands

After setting up your database:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```


