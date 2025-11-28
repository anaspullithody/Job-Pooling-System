# Job Management Portal

A comprehensive job management system built with Next.js 16, Prisma, and Shadcn UI for managing client travel jobs, supplier coordination, and driver workflows.

## Features

- **Job Management**: Create, edit, delete, and track jobs through their lifecycle
- **Supplier & Client Management**: Manage suppliers with categories and vehicles, and clients with contacts
- **Driver Interface**: Mobile-optimized PWA for drivers to view and update job status
- **Bulk Operations**: Bulk status updates and bulk delete for jobs
- **Reports**: Export supplier-wise, client-wise, and daily summary reports in Excel and PDF
- **Role-Based Access**: SUPER_ADMIN, ACCOUNTANT, and DRIVER roles with appropriate permissions
- **Authentication**: Clerk for admin users, custom phone+PIN for drivers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Shadcn UI + Tailwind CSS
- **Authentication**: Clerk (admin) + Custom JWT (drivers)
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table
- **Exports**: xlsx (Excel) + pdfkit (PDF)

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (local or cloud)
- Clerk account (for admin authentication)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Environment Variables

Copy `env.example.txt` to `.env.local` and fill in the required values:

```bash
cp env.example.txt .env.local
```

Required environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/job_portal

# JWT Secret (for driver auth)
JWT_SECRET=your_jwt_secret_here

# Timezone
TZ=Asia/Dubai
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed Database

Run the seed script to create initial users and sample data:

```bash
npm run db:seed
```

This creates:
- SUPER_ADMIN user: `admin@example.com` / `admin123`
- ACCOUNTANT user: `accountant@example.com` / `accountant123`
- DRIVER user: Phone `+971501234567` / PIN `1234`
- Sample clients and suppliers

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Clerk authentication routes
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── jobs/        # Job management
│   │   ├── suppliers/   # Supplier management
│   │   ├── clients/     # Client management
│   │   ├── reports/     # Reports
│   │   └── drivers/     # Driver management
│   ├── driver/          # Driver routes (custom auth)
│   └── api/             # API routes
├── components/
│   ├── ui/              # Shadcn UI components
│   └── layout/          # Layout components
├── features/
│   ├── jobs/            # Job feature modules
│   ├── suppliers/       # Supplier feature modules
│   ├── clients/         # Client feature modules
│   └── reports/         # Report feature modules
├── lib/
│   ├── auth/            # Authentication utilities
│   ├── db/              # Prisma client
│   └── utils/           # Shared utilities
└── types/               # TypeScript types
```

## User Roles

### SUPER_ADMIN
- Full system access
- Create/edit/delete jobs
- Manage suppliers, clients, categories, vehicles
- Bulk operations
- Export reports
- Reset driver PINs

### ACCOUNTANT
- View completed and failed jobs
- View and export reports
- Cannot edit jobs

### DRIVER
- Login with phone + PIN
- View current day's assigned job
- Update job status (Accepted → Started → Picked → Completed)

## Job Status Flow

1. **IN_POOL** - Job created, waiting for assignment
2. **ASSIGNED** - Job assigned to supplier/driver
3. **STARTED** - Driver has started the job
4. **PICKED** - Guest has been picked up
5. **COMPLETED** - Job completed successfully
6. **CANCELLED** - Job cancelled
7. **FAILED** - Job failed (requires reason)

## API Routes

### Jobs
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Soft delete job
- `POST /api/jobs/bulk` - Bulk operations
- `GET /api/jobs/[id]/whatsapp-message` - Get WhatsApp message

### Suppliers & Clients
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `DELETE /api/suppliers/[id]` - Delete supplier
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `DELETE /api/clients/[id]` - Delete client

### Driver
- `POST /api/auth/driver/login` - Driver login
- `POST /api/auth/driver/logout` - Driver logout
- `GET /api/driver/jobs/current` - Get current job
- `PATCH /api/driver/jobs/[id]/status` - Update job status

### Reports
- `GET /api/reports/export` - Export reports (Excel/PDF)

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Deployment

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the App Platform dashboard
3. Configure build command: `npm run build`
4. Set start command: `npm start`
5. Add managed PostgreSQL database

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Clerk keys
- Database URL
- JWT secret
- Timezone

## Notes

- All dates are stored in UTC and displayed in Asia/Dubai timezone
- Jobs are soft-deleted (deletedAt field)
- Driver authentication uses JWT tokens stored in HTTP-only cookies
- Reports can be exported in Excel (.xlsx) or PDF format

## License

MIT
