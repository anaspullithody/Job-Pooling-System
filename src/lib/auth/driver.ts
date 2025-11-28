import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface DriverTokenPayload {
  userId: string;
  phone: string;
  role: UserRole;
}

export async function verifyDriverCredentials(phone: string, pin: string) {
  const user = await prisma.user.findUnique({
    where: { phone }
  });

  if (!user || user.role !== UserRole.DRIVER || !user.pinHash) {
    return null;
  }

  const isValid = await bcrypt.compare(pin, user.pinHash);
  if (!isValid) {
    return null;
  }

  return user;
}

export function generateDriverToken(userId: string, phone: string): string {
  const payload: DriverTokenPayload = {
    userId,
    phone,
    role: UserRole.DRIVER
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d' // 30 days
  });
}

export function verifyDriverToken(token: string): DriverTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DriverTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}
