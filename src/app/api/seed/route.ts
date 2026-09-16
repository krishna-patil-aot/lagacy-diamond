import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DiamondModel } from "@/models/Diamond";
import { UserModel } from "@/models/User";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { success: false, message: "Database connection unavailable." },
        { status: 500 }
      );
    }

    const diamondCount = await DiamondModel.countDocuments();
    const adminUser = await UserModel.findOne({ email: "engrkrishnapatil@gmail.com" }).lean();

    return NextResponse.json({
      success: true,
      diamondCount,
      masterAdminConfigured: Boolean(adminUser),
      adminEmail: adminUser ? adminUser.email : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database check failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
