import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyDriverToken } from "@/lib/auth/driver";
import { cookies } from "next/headers";
import { JobStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

// GET /api/driver/jobs/current - Get current day's job for driver
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("driver_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyDriverToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get current day in UAE timezone
    const now = new Date();
    const uaeDate = zonedTimeToUtc(now, "Asia/Dubai");
    const dayStart = startOfDay(uaeDate);
    const dayEnd = endOfDay(uaeDate);

    // Find job assigned to this driver for today
    const job = await prisma.job.findFirst({
      where: {
        driverName: {
          // Match by driver phone or name - adjust based on your logic
          // For now, we'll use a simple approach
        },
        status: {
          in: [JobStatus.ASSIGNED, JobStatus.STARTED, JobStatus.PICKED],
        },
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If no job found by driverName, try to find by user phone
    // This is a simplified approach - you may need to adjust based on your data model
    if (!job) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user?.phone) {
        // Try to find job by matching driver phone or other criteria
        // This is a placeholder - adjust based on your requirements
      }
    }

    if (!job) {
      return NextResponse.json({ job: null });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Error fetching driver job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

