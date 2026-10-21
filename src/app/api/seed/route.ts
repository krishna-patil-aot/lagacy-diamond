import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { DiamondModel } from "@/models/Diamond";
import { UserModel } from "@/models/User";
import { getMasterAdminEmail } from "@/lib/auth";
import { INITIAL_DIAMONDS } from "@/lib/mock-data";
import { purgeAllCache } from "@/lib/cache-service";

export async function GET() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { success: false, message: "Database connection unavailable." },
        { status: 500 }
      );
    }

    const masterEmail = getMasterAdminEmail();
    const diamondCount = await DiamondModel.countDocuments();
    const adminUser = await UserModel.findOne({ email: masterEmail }).lean();

    return NextResponse.json({
      success: true,
      diamondCount,
      masterAdminConfigured: Boolean(adminUser),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database check failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const mongoose = await connectToDatabase();
    if (!mongoose) {
      return NextResponse.json(
        { success: false, message: "Database connection unavailable for seeding." },
        { status: 500 }
      );
    }

    // Clear existing diamonds and re-seed from INITIAL_DIAMONDS
    await DiamondModel.deleteMany({});

    const sanitizedLots = INITIAL_DIAMONDS.map((item) => {
      const lot = { ...item };
      delete (lot as { _id?: string })._id;
      return lot;
    });

    const inserted = await DiamondModel.insertMany(sanitizedLots);

    // Enterprise Cache Purge: Invalidate all catalog query caches and item caches
    await purgeAllCache();

    return NextResponse.json({
      success: true,
      count: inserted.length,
      message: `Successfully seeded ${inserted.length} certified diamonds and purged cache.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Catalog seeding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
