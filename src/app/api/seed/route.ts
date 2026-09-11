import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";
import { DiamondModel } from "@/models/Diamond";
import { INITIAL_DIAMONDS } from "@/lib/mock-data";
import { hashPassword } from "@/lib/auth";

async function executeSeed() {
  const mongoose = await connectToDatabase();
  if (!mongoose) {
    return {
      success: false,
      message: "Could not connect to MongoDB database. Please verify MONGODB_URI.",
    };
  }

  // 1. Seed or Upsert Default Admin
  const adminPasswordHash = await hashPassword("AdminPassword123!");
  const adminUser = await UserModel.findOneAndUpdate(
    { email: "admin@diamondfoundry.luxury" },
    {
      name: "Eleanor Vance (Vault Curator)",
      email: "admin@diamondfoundry.luxury",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      authProvider: "credentials",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    { upsert: true, new: true }
  );

  // 2. Seed or Upsert Default Client
  const clientPasswordHash = await hashPassword("Password123!");
  const clientUser = await UserModel.findOneAndUpdate(
    { email: "client@estate.luxury" },
    {
      name: "Lady Victoria Kensington",
      email: "client@estate.luxury",
      passwordHash: clientPasswordHash,
      role: "CUSTOMER",
      authProvider: "credentials",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    { upsert: true, new: true }
  );

  // 3. Seed Diamonds if empty
  const diamondCount = await DiamondModel.countDocuments();
  let seededDiamonds = diamondCount;
  if (diamondCount === 0) {
    const sanitizedLots = INITIAL_DIAMONDS.map((item) => {
      const lot = { ...item };
      delete (lot as { _id?: string })._id;
      return lot;
    });
    const created = await DiamondModel.insertMany(sanitizedLots);
    seededDiamonds = created.length;
  }

  return {
    success: true,
    message: "Database seeded successfully with default Admin & Client accounts!",
    admin: {
      email: adminUser.email,
      role: adminUser.role,
      passwordHint: "AdminPassword123!",
    },
    client: {
      email: clientUser.email,
      role: clientUser.role,
      passwordHint: "Password123!",
    },
    diamondCount: seededDiamonds,
  };
}

export async function GET() {
  try {
    const result = await executeSeed();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database seeding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await executeSeed();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database seeding failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
