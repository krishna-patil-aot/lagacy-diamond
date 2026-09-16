import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/user-repository";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const found = await findUserByEmail(normalizedEmail);
    if (!found || !found.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password credentials." },
        { status: 401 }
      );
    }

    if (found.user.role === "ADMIN" && normalizedEmail !== "engrkrishnapatil@gmail.com") {
      return NextResponse.json(
        { success: false, error: "Admin Vault is restricted to authorized master curator." },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, found.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password credentials." },
        { status: 401 }
      );
    }


    const token = signToken({
      userId: found.user.id,
      email: found.user.email,
      role: found.user.role,
      name: found.user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: found.user,
        token,
      },
    });

    response.cookies.set("diamond_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
