import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { IOrder, OrderStatus, IOrderTimelineEvent } from "@/types/order.types";
const memoryOrders: IOrder[] = [];

export function sanitizeOrderDoc(doc: {
  _id?: string | { toString(): string };
  id?: string;
  orderNumber?: string;
  userId?: string | { toString(): string };
  items: IOrder["items"];
  shippingAddress: IOrder["shippingAddress"];
  paymentInfo: IOrder["paymentInfo"];
  subtotal: number;
  couponDiscount: number;
  totalAmount: number;
  status: OrderStatus;
  trackingInfo?: IOrder["trackingInfo"];
  timeline?: IOrderTimelineEvent[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  approvedAt?: string;
}): IOrder {
  const idStr = String(doc.id || doc._id || "");
  const orderNumberStr = doc.orderNumber || `ORD-${idStr.slice(-6).toUpperCase()}`;

  return {
    id: idStr,
    orderNumber: orderNumberStr,
    userId: doc.userId ? String(doc.userId) : undefined,
    items: doc.items,
    shippingAddress: doc.shippingAddress,
    paymentInfo: doc.paymentInfo,
    subtotal: doc.subtotal,
    couponDiscount: doc.couponDiscount || 0,
    totalAmount: doc.totalAmount,
    status: doc.status,
    trackingInfo: doc.trackingInfo || {
      carrier: "Brink's Global Armored Services",
      trackingNumber: `BRK-${orderNumberStr}`,
      vaultOrigin: "Geneva Vault Facility A",
      transitType: "ARMORED_GROUND",
      biometricSignatureRequired: true,
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
    timeline: doc.timeline && doc.timeline.length > 0 ? doc.timeline : [
      {
        status: doc.status,
        title: "Order Received & Verified",
        description: "Your acquisition request is logged in the foundry vault register.",
        location: "Geneva Central Foundry Vault",
        timestamp: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      },
    ],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    approvedAt: doc.approvedAt,
  };
}

export async function createOrder(
  orderInput: Omit<IOrder, "id">,
  userId?: string
): Promise<IOrder> {
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
  const initialTimeline: IOrderTimelineEvent[] = [
    {
      status: "PENDING_APPROVAL",
      title: "Order Transmitted to Vault Curator",
      description: "Acquisition request forwarded to Lead Gemologist for physical certificate and inscription inspection.",
      location: "Geneva Central Foundry Vault",
      timestamp: new Date().toISOString(),
    },
  ];

  const initialTracking = {
    carrier: "Brink's Global Armored Services",
    trackingNumber: `BRK-${orderNumber}`,
    vaultOrigin: "Geneva Central Foundry Vault",
    transitType: "ARMORED_GROUND" as const,
    biometricSignatureRequired: true,
    estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  const mongoose = await connectToDatabase();

  if (mongoose) {
    const newDoc = await OrderModel.create({
      orderNumber,
      userId: userId || undefined,
      items: orderInput.items,
      shippingAddress: orderInput.shippingAddress,
      paymentInfo: orderInput.paymentInfo,
      subtotal: orderInput.subtotal,
      couponDiscount: orderInput.couponDiscount || 0,
      totalAmount: orderInput.totalAmount,
      status: "PENDING_APPROVAL",
      trackingInfo: initialTracking,
      timeline: initialTimeline,
    });

    return sanitizeOrderDoc(newDoc.toObject());
  }

  // Fallback to memory
  const memoryOrder: IOrder = {
    ...orderInput,
    id: `mem-${orderNumber}`,
    orderNumber,
    userId,
    status: "PENDING_APPROVAL",
    trackingInfo: initialTracking,
    timeline: initialTimeline,
    createdAt: new Date().toISOString(),
  };
  memoryOrders.unshift(memoryOrder);
  return memoryOrder;
}

export async function getUserOrders(
  userId?: string,
  userEmail?: string
): Promise<IOrder[]> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const query: Record<string, unknown> = {};
    if (userId) {
      query.$or = [{ userId }, { "shippingAddress.email": userEmail?.toLowerCase() }];
    } else if (userEmail) {
      query["shippingAddress.email"] = userEmail.toLowerCase();
    }

    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(sanitizeOrderDoc);
  }

  // Memory fallback
  return memoryOrders.filter(
    (o) =>
      (userId && o.userId === userId) ||
      (userEmail && o.shippingAddress.email.toLowerCase() === userEmail.toLowerCase())
  );
}

export async function getOrderById(
  orderIdOrNumber: string,
  requestingUserId?: string,
  isAdmin: boolean = false
): Promise<IOrder | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const query: Record<string, unknown> = {
      $or: [{ _id: orderIdOrNumber }, { orderNumber: orderIdOrNumber.toUpperCase() }],
    };

    let doc;
    try {
      doc = await OrderModel.findOne(query).lean();
    } catch {
      // If orderId is not a valid ObjectId, search by orderNumber only
      doc = await OrderModel.findOne({ orderNumber: orderIdOrNumber.toUpperCase() }).lean();
    }

    if (!doc) return null;

    // Strict IDOR safety check
    if (!isAdmin && requestingUserId && doc.userId && String(doc.userId) !== requestingUserId) {
      return null;
    }

    return sanitizeOrderDoc(doc);
  }

  const found = memoryOrders.find(
    (o) =>
      o.id === orderIdOrNumber ||
      o.orderNumber?.toUpperCase() === orderIdOrNumber.toUpperCase()
  );

  if (!found) return null;
  if (!isAdmin && requestingUserId && found.userId && found.userId !== requestingUserId) {
    return null;
  }
  return found;
}

export async function getAllOrdersAdmin(statusFilter?: OrderStatus | "ALL"): Promise<IOrder[]> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    const query = statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {};
    const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(sanitizeOrderDoc);
  }

  if (statusFilter && statusFilter !== "ALL") {
    return memoryOrders.filter((o) => o.status === statusFilter);
  }
  return memoryOrders;
}

export async function updateOrderStatusAdmin(
  orderId: string,
  newStatus: OrderStatus,
  options?: {
    carrier?: string;
    trackingNumber?: string;
    note?: string;
  }
): Promise<IOrder | null> {
  const mongoose = await connectToDatabase();
  const timestamp = new Date().toISOString();

  const statusDescriptions: Record<OrderStatus, { title: string; defaultDesc: string }> = {
    PENDING_APPROVAL: {
      title: "Order Placed & Awaiting Curator Review",
      defaultDesc: "Order awaiting Lead Gemologist verification.",
    },
    APPROVED: {
      title: "Curator Accepted & Inscription Verified",
      defaultDesc: "Laser inscription verified against GIA certificate registry. Armored transfer scheduled.",
    },
    DISPATCHED: {
      title: "Transferred to Armored Carrier",
      defaultDesc: "Sealed in tamper-evident high-security vault pouch and handed to armed couriers.",
    },
    IN_TRANSIT: {
      title: "In Armed Transit Across Hubs",
      defaultDesc: "Consignment is moving under constant satellite and armed guard surveillance.",
    },
    OUT_FOR_DELIVERY: {
      title: "Armored Van Out for Delivery",
      defaultDesc: "Armed courier van en route for scheduled private handover.",
    },
    DELIVERED: {
      title: "Hand-Delivered & Biometrically Signed",
      defaultDesc: "Order successfully delivered with client biometric identification verified.",
    },
    CANCELLED: {
      title: "Order Cancelled by Vault Curator",
      defaultDesc: "Lot reservation released back into foundry custody.",
    },
  };

  const statusMeta = statusDescriptions[newStatus];
  const newTimelineEvent: IOrderTimelineEvent = {
    status: newStatus,
    title: statusMeta.title,
    description: options?.note || statusMeta.defaultDesc,
    location: "Brink's Armored Transit Center",
    timestamp,
  };

  if (mongoose) {
    let doc = await OrderModel.findById(orderId);
    if (!doc) {
      doc = await OrderModel.findOne({ orderNumber: orderId.toUpperCase() });
    }
    if (!doc) return null;

    doc.status = newStatus;
    if (newStatus === "APPROVED") {
      doc.approvedAt = timestamp;
    }
    if (options?.carrier || options?.trackingNumber) {
      doc.trackingInfo = {
        carrier: options.carrier || doc.trackingInfo?.carrier || "Brink's Global Armored Services",
        trackingNumber: options.trackingNumber || doc.trackingInfo?.trackingNumber || `BRK-${doc.orderNumber}`,
        vaultOrigin: doc.trackingInfo?.vaultOrigin || "Geneva Central Foundry Vault",
        transitType: doc.trackingInfo?.transitType || "ARMORED_GROUND",
        biometricSignatureRequired: true,
        estimatedDeliveryDate: doc.trackingInfo?.estimatedDeliveryDate,
        actualDeliveryDate: newStatus === "DELIVERED" ? timestamp : undefined,
      };
    }

    doc.timeline = [...(doc.timeline || []), newTimelineEvent];
    await doc.save();
    return sanitizeOrderDoc(doc.toObject());
  }

  // Memory fallback
  const index = memoryOrders.findIndex(
    (o) => o.id === orderId || o.orderNumber?.toUpperCase() === orderId.toUpperCase()
  );
  if (index === -1) return null;

  const current = memoryOrders[index];
  const updated: IOrder = {
    ...current,
    status: newStatus,
    approvedAt: newStatus === "APPROVED" ? timestamp : current.approvedAt,
    trackingInfo: {
      carrier: options?.carrier || current.trackingInfo?.carrier || "Brink's Global Armored Services",
      trackingNumber: options?.trackingNumber || current.trackingInfo?.trackingNumber || `BRK-${current.orderNumber}`,
      vaultOrigin: current.trackingInfo?.vaultOrigin || "Geneva Central Foundry Vault",
      transitType: current.trackingInfo?.transitType || "ARMORED_GROUND",
      biometricSignatureRequired: true,
      estimatedDeliveryDate: current.trackingInfo?.estimatedDeliveryDate,
      actualDeliveryDate: newStatus === "DELIVERED" ? timestamp : undefined,
    },
    timeline: [...(current.timeline || []), newTimelineEvent],
    updatedAt: timestamp,
  };

  memoryOrders[index] = updated;
  return updated;
}
