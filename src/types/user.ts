// User-related types
// These are duplicated from Prisma to avoid importing @prisma/client in client components

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ACCOUNTANT = 'ACCOUNTANT',
  DRIVER = 'DRIVER'
}

export interface User {
  id: string;
  role: UserRole;
  email?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  pinHash?: string | null;
  pinTemp?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
