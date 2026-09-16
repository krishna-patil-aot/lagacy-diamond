import { connectToDatabase } from "@/lib/db";
import { StockNotificationModel, IStockNotificationDocument } from "@/models/StockNotification";
import {
  IStockNotification,
  ICreateStockNotificationInput,
} from "@/types/stock-notification.types";
import { IDiamond } from "@/types/diamond.types";
import mongoose from "mongoose";

function sanitizeNotification(doc: IStockNotificationDocument): IStockNotification {
  return {
    id: String(doc._id),
    diamondId: String(doc.diamondId),
    diamondSku: doc.diamondSku,
    diamondName: doc.diamondName,
    email: doc.email,
    clientName: doc.clientName || "Valued Client",
    notified: Boolean(doc.notified),
    notifiedAt: doc.notifiedAt ? doc.notifiedAt.toISOString() : undefined,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

/**
 * Register a client's request to be notified when a diamond lot returns to stock
 */
export async function subscribeToStockNotification(
  input: ICreateStockNotificationInput
): Promise<IStockNotification> {
  await connectToDatabase();

  const normalizedEmail = input.email.toLowerCase().trim();
  const diamondObjectId = new mongoose.Types.ObjectId(input.diamondId);

  // Check if an un-notified alert already exists for this client and specimen
  const existing = await StockNotificationModel.findOne({
    diamondId: diamondObjectId,
    email: normalizedEmail,
    notified: false,
  });

  if (existing) {
    return sanitizeNotification(existing);
  }

  const newRecord = await StockNotificationModel.create({
    diamondId: diamondObjectId,
    diamondSku: input.diamondSku.toUpperCase().trim(),
    diamondName: input.diamondName.trim(),
    email: normalizedEmail,
    clientName: input.clientName || "Valued Client",
    notified: false,
  });

  return sanitizeNotification(newRecord);
}

/**
 * Retrieve all pending (un-notified) subscribers for a specific diamond lot
 */
export async function getPendingNotificationsForDiamond(
  diamondId: string
): Promise<IStockNotification[]> {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(diamondId)) {
    return [];
  }

  const records = await StockNotificationModel.find({
    diamondId: new mongoose.Types.ObjectId(diamondId),
    notified: false,
  });

  return records.map(sanitizeNotification);
}

/**
 * Mark a batch of notification subscriptions as dispatched
 */
export async function markNotificationsAsSent(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  await connectToDatabase();
  const objectIds = ids
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  await StockNotificationModel.updateMany(
    { _id: { $in: objectIds } },
    {
      $set: {
        notified: true,
        notifiedAt: new Date(),
      },
    }
  );
}

/**
 * Dispatch back-in-stock alert emails to all subscribers for a newly restocked specimen
 */
export async function dispatchStockAlertsForDiamond(
  diamondId: string,
  diamond: IDiamond
): Promise<number> {
  const pending = await getPendingNotificationsForDiamond(diamondId);
  if (pending.length === 0) return 0;

  const { sendBackInStockEmail } = await import("@/lib/mailer");

  const sentIds: string[] = [];
  for (const subscriber of pending) {
    try {
      const result = await sendBackInStockEmail({
        to: subscriber.email,
        clientName: subscriber.clientName,
        diamond,
      });
      if (result.success) {
        sentIds.push(subscriber.id);
      } else {
        console.error(
          `[Stock Notification Dispatch Error] Service error for ${subscriber.email}:`,
          result.error
        );
      }
    } catch (err) {
      console.error(
        `[Stock Notification Dispatch Error] Failed to notify ${subscriber.email}:`,
        err
      );
    }
  }

  if (sentIds.length > 0) {
    await markNotificationsAsSent(sentIds);
  }

  return sentIds.length;
}
