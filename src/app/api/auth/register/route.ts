import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/user-repository";
import { hashPassword, signToken } from "@/lib/auth";
import { UserRole } from "@/types/auth.types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

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
    const assignedRole: UserRole = role === "ADMIN" ? "ADMIN" : "CUSTOMER";

    const user = await createUser({
      name,
      email,
      passwordHash,
      role: assignedRole,
      authProvider: "credentials",
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          token,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
