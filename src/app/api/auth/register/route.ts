import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/user-repository";
import { hashPassword, signToken } from "@/lib/auth";
import { UserRole } from "@/types/auth.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;


    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const assignedRole: UserRole = "CUSTOMER";

    const user = await createUser({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      authProvider: "credentials",
    });

    try {
      const { sendRegistrationSuccessEmail } = await import("@/lib/mailer");
      await sendRegistrationSuccessEmail({
        to: user.email,
        clientName: user.name,
      });
    } catch (emailErr) {
      console.error("[Register Route Welcome Email Error]:", emailErr);
    }


    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user,
          token,
        },
      },
      { status: 201 }
    );

    response.cookies.set("diamond_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
