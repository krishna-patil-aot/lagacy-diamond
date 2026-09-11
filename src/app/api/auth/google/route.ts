import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/user-repository";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, googleId, avatarUrl, role } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Google account profile information missing" },
        { status: 400 }
      );
    }

    const userRecord = await findUserByEmail(email);

    if (!userRecord) {
      const newUser = await createUser({
        name,
        email,
        googleId: googleId || `goog-${Date.now()}`,
        avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        authProvider: "google",
        role: role === "ADMIN" ? "ADMIN" : "CUSTOMER",
      });

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      });

      return NextResponse.json({
        success: true,
        data: {
          user: newUser,
          token,
        },
      });
    }

    const token = signToken({
      userId: userRecord.user.id,
      email: userRecord.user.email,
      role: userRecord.user.role,
      name: userRecord.user.name,
    });

    return NextResponse.json({
      success: true,
      data: {
        user: userRecord.user,
        token,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google sign-in failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
