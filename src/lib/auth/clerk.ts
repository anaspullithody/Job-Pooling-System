import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../db/prisma";
import { UserRole } from "@prisma/client";

export async function getClerkUserRole(): Promise<UserRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser?.emailAddresses?.[0]?.emailAddress) return null;

  // Find user in database by email
  const user = await prisma.user.findUnique({
    where: { email: clerkUser.emailAddresses[0].emailAddress },
    select: { role: true },
  });

  return user?.role || null;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const role = await getClerkUserRole();
  if (!role || !allowedRoles.includes(role)) {
    throw new Error("Unauthorized");
  }
  return role;
}

export async function requireSuperAdmin() {
  return requireRole([UserRole.SUPER_ADMIN]);
}

export async function requireAdminOrAccountant() {
  return requireRole([UserRole.SUPER_ADMIN, UserRole.ACCOUNTANT]);
}

