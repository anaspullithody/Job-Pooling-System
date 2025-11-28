import { NextRequest, NextResponse } from "next/server";
import { verifyDriverCredentials, generateDriverToken } from "@/lib/auth/driver";
import { z } from "zod";

const loginSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  pin: z.string().min(4, "PIN must be at least 4 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, pin } = loginSchema.parse(body);

    const user = await verifyDriverCredentials(phone, pin);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone number or PIN" },
        { status: 401 }
      );
    }

    // Check if PIN needs to be changed
    if (user.pinTemp) {
      return NextResponse.json(
        { error: "PIN must be changed", requiresPinChange: true },
        { status: 403 }
      );
    }

    const token = generateDriverToken(user.id, user.phone!);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("driver_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Driver login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

