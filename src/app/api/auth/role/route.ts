import { NextResponse } from 'next/server';
import { getClerkUserRole } from '@/lib/auth/clerk';

// GET /api/auth/role - Get current user's role
export async function GET() {
  try {
    const role = await getClerkUserRole();

    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
