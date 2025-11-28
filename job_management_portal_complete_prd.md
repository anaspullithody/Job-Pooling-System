
# JOB MANAGEMENT PORTAL – COMPLETE PRD (v1.0)

## 1. SYSTEM OVERVIEW
The Job Management Portal is a centralized internal tool used for managing client travel jobs, supplier coordination, own-fleet assignments, driver workflows, and operational reporting. All jobs are manually created by Operations Heads. Suppliers and clients do not access the system. Drivers use a simple PIN-based mobile login.

## 2. USER ROLES

### 2.1 SUPER_ADMIN (Operations Heads)
- Create/edit/delete jobs
- Bulk update job statuses
- Bulk delete jobs
- Manage suppliers, clients, categories, vehicles
- Assign own-fleet jobs (driver + plate)
- Reset driver PINs
- Export reports
- Generate WhatsApp job messages
- Full system access

### 2.2 ACCOUNTANT
- View completed and failed jobs
- View reports (client-wise, supplier-wise)
- Export as Excel/PDF
- Cannot edit jobs

### 2.3 DRIVER
- Login with phone + PIN
- View current day’s assigned job
- Update status (Accepted → Started → Picked → Completed)
- Reset PIN via email OTP or via Ops

## 3. USE CASES

### UC-01: Create Job
Ops selects client → supplier → category → vehicle → enters details → saves job → job enters IN_POOL.

### UC-02: Assign Job
Ops updates supplier/category/vehicle/driver info → status = ASSIGNED.

### UC-03: Own Fleet Job
Ops selects “Own Company” → driver name + vehicle plate required.

### UC-04: Job Failure
Ops sets status = FAILED, reason required.

### UC-05: Bulk Operations
Ops selects multiple jobs:
- Bulk Status Change
- Bulk Delete (soft delete)

### UC-06: Driver Workflows
Driver logs in → sees job → updates status.

### UC-07: WhatsApp Job Message
Ops clicks “Copy Message” button → formatted job sheet.

### UC-08: Reporting
Accountant/Ops export:
- Supplier-wise jobs
- Client-wise jobs
- Daily Summary
- All Completed Jobs

### UC-09: Manage Suppliers
Ops adds supplier → contact → categories → vehicles.

### UC-10: Manage Clients
Ops adds client → mobile number → notes.

## 4. JOB STATUSES
- IN_POOL  
- ASSIGNED  
- STARTED  
- PICKED  
- COMPLETED  
- CANCELLED  
- FAILED (requires reason)

## 5. SCREENS

### Web (Ops & Accountant)
1. Login (email + password)
2. Job Pool (filterable table)
3. Create Job Form
4. Job Detail Page
5. Bulk Action Toolbar
6. Supplier Management
7. Client Management
8. Reports Page
9. Driver PIN Reset Page

### Driver PWA
1. Phone + PIN Login
2. Current Job View
3. Update Job Status
4. Reset PIN (via email or Ops)

## 6. AUTHENTICATION

### Admin (Ops & Accountant)
- NextAuth (Credentials provider)
- Email + password login
- Server-side session cookies

### Driver Authentication
- Login with phone + PIN
- PIN stored hashed
- PIN can be:
  - Reset by Ops
  - Reset via email OTP (if email exists)
- PIN must be changed after temporary reset

## 7. TECH STACK

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand

### Backend
- Next.js API routes
- Prisma ORM
- Zod validation

### Database
- DigitalOcean Managed PostgreSQL

### Notifications
- Manual WhatsApp copy message (Phase 1)
- Optional: Twilio SMS for OTP (Phase 2)

### Deployment
- DigitalOcean App Platform
- Managed Postgres
- GitHub Actions CI/CD

## 8. DATABASE (PRISMA-READY MODEL SUMMARY)

### User
- id, role, email, phone, password, pinHash, pinTemp

### Company
- id, kind (CLIENT/SUPPLIER/OWN_FLEET), name, phone

### Contact
- id, companyId, phone, email

### SupplierCategory
- id, companyId, category, vehicleCount

### SupplierVehicle
- id, supplierId, category, regNumber, model

### Job
- id, clientId, supplierId, guestName, guestContact, pickup, drop, flight, category, vehicle, status  
- price, taxAmount, totalAmount, failureReason, driverName, assignedPlate

### JobLog
- id, jobId, actorId, action, notes

### Invoice
- id, jobId, invoiceNo, issuedTo, amount, tax, total

## 9. API SUMMARY

### Jobs
- Create Job  
- Get Jobs (filters)  
- Update Job  
- Change Status  
- Bulk Status Change  
- Bulk Delete  
- Get WhatsApp Message Text  

### Suppliers & Clients
- List/Add/Edit  
- Get categories  
- Get vehicles  

### Driver
- Login with phone + PIN  
- Reset PIN  
- Update job status  
- View current jobs  

### Reports
- Supplier-wise  
- Client-wise  
- Daily summary  

## 10. OPERATIONAL NOTES
- Peak hours: 4–7 PM UAE  
- Indexed DB queries  
- Weekly backups  
- Soft delete for jobs  
- Data retention: 1 year  

