import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import { UserModel } from "@/models/User";
import { IOrder, OrderStatus, IOrderTimelineEvent } from "@/types/order.types";
import {
  IDiamond,
  DiamondShape,
  DiamondColor,
  DiamondClarity,
  DiamondCut,
  CertificationLab,
} from "@/types/diamond.types";
const memoryOrders: IOrder[] = [];

export function clearMemoryOrders(): void {
  memoryOrders.length = 0;
}

/**
 * Resiliently sanitize an order gemstone item, ensuring complete IDiamond compliance
 * even if stored under legacy or incomplete schemas without dimensions.
 */
export function sanitizeOrderItem(item: unknown, idx = 0): IDiamond {
  const r = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
  const rawId = r._id || r.id || `dia-${idx}-${Date.now()}`;
  const name = String(r.name || r.title || "Certified Lab Diamond");
  const price = typeof r.price === "number" ? r.price : 0;
  const finalPrice = typeof r.finalPrice === "number" ? r.finalPrice : price;
  const carat = Number(r.carat) || 1.0;
  const certNum =
    r.certificateNumber ||
    r.certificate ||
    `GIA-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const rawDimensions =
    typeof r.dimensions === "object" && r.dimensions
      ? (r.dimensions as Record<string, unknown>)
      : {};

  const length =
    typeof rawDimensions.length === "number" && rawDimensions.length > 0
      ? rawDimensions.length
      : Number((carat * 6.5).toFixed(2));
  const width =
    typeof rawDimensions.width === "number" && rawDimensions.width > 0
      ? rawDimensions.width
      : Number((carat * 6.5).toFixed(2));
  const depth =
    typeof rawDimensions.depth === "number" && rawDimensions.depth > 0
      ? rawDimensions.depth
      : Number((carat * 4.0).toFixed(2));

  return {
    _id: String(rawId),
    name,
    sku: String(r.sku || `DIA-${String(rawId).slice(-6)}`),
    shape: (r.shape as DiamondShape) || "Round",
    carat,
    color: (r.color as DiamondColor) || "F",
    clarity: (r.clarity as DiamondClarity) || "VS1",
    cut: (r.cut as DiamondCut) || "Ideal",
    price,
    discountPercentage: Number(r.discountPercentage) || 0,
    finalPrice,
    lab: (r.lab as CertificationLab) || "GIA",
    certificateNumber: String(certNum),
    dimensions: {
      length,
      width,
      depth,
    },
    tablePercentage: typeof r.tablePercentage === "number" ? r.tablePercentage : 58,
    depthPercentage: typeof r.depthPercentage === "number" ? r.depthPercentage : 61.5,
    polish: (r.polish as DiamondCut) || "Excellent",
    symmetry: (r.symmetry as DiamondCut) || "Excellent",
    fluorescence:
      (r.fluorescence as "None" | "Faint" | "Medium" | "Strong") || "None",
    images: Array.isArray(r.images)
      ? (r.images as string[])
      : typeof r.image === "string"
      ? [r.image]
      : [],
    description: String(r.description || ""),
    stockQuantity: typeof r.stockQuantity === "number" ? r.stockQuantity : 1,
    featured: Boolean(r.featured),
    createdAt: String(r.createdAt || new Date().toISOString()),
    updatedAt: String(r.updatedAt || new Date().toISOString()),
  };
}

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
    items: Array.isArray(doc.items)
      ? doc.items.map((item, idx) => sanitizeOrderItem(item, idx))
      : [],
    shippingAddress: doc.shippingAddress || {
      fullName: "Valued Client",
      email: "client@diamond.luxury",
      phone: "",
      street: "",
      city: "Geneva",
      state: "",
      postalCode: "",
      country: "India",
    },
    paymentInfo: doc.paymentInfo || {
      method: "CREDIT_CARD",
      couponDiscountPercentage: 0,
    },
    subtotal: doc.subtotal || 0,
    couponDiscount: doc.couponDiscount || 0,
    totalAmount: doc.totalAmount || 0,
    status: doc.status || "PENDING_APPROVAL",
    trackingInfo: doc.trackingInfo || {
      carrier: "Brink's Global Armored Services",
      trackingNumber: `BRK-${orderNumberStr}`,
      vaultOrigin: "Geneva Central Foundry Vault",
      transitType: "ARMORED_GROUND",
      biometricSignatureRequired: true,
      estimatedDeliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
    timeline: doc.timeline || [],
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
    approvedAt: doc.approvedAt,
  };
}

export async function createOrder(
  orderInput: Omit<IOrder, "id">,
  userId?: string,
  userEmail?: string
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

  // Resilient sanitization of items to match DB schema guarantees (DRY)
  const sanitizedItems: IDiamond[] = (orderInput.items || []).map((item, idx) =>
    sanitizeOrderItem(item, idx)
  );

  // Resilient sanitization of shipping address
  const rawAddress = (orderInput.shippingAddress || {}) as unknown as Record<string, unknown>;
  const resolvedEmail = String(rawAddress.email || userEmail || "client@diamond.luxury").trim().toLowerCase();
  const sanitizedAddress = {
    fullName: String(rawAddress.fullName || "Valued Client").trim(),
    email: resolvedEmail,
    phone: String(rawAddress.phone || "").trim(),
    street: String(rawAddress.street || rawAddress.addressLine1 || rawAddress.address || "Curator Vault Custody").trim(),
    city: String(rawAddress.city || "Geneva").trim(),
    state: String(rawAddress.state || "").trim(),
    postalCode: String(rawAddress.postalCode || rawAddress.zipCode || "").trim(),
    country: String(rawAddress.country || "India").trim(),
  };

  // Resilient sanitization of payment info
  const rawPayment = (orderInput.paymentInfo || {}) as unknown as Record<string, unknown>;
  let normalizedMethod: "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW" = "CREDIT_CARD";
  if (rawPayment.method) {
    const m = String(rawPayment.method).toUpperCase();
    if (m.includes("WIRE")) normalizedMethod = "WIRE_TRANSFER";
    else if (m.includes("ESCROW") || m.includes("VAULT")) normalizedMethod = "VAULT_ESCROW";
    else normalizedMethod = "CREDIT_CARD";
  }
  const sanitizedPayment = {
    method: normalizedMethod,
    couponCode: String(rawPayment.couponCode || "").toUpperCase().trim(),
    couponDiscountPercentage: Number(rawPayment.couponDiscountPercentage) || 0,
  };

  const mongoose = await connectToDatabase();

  if (mongoose) {
    let safeUserId: InstanceType<typeof mongoose.Types.ObjectId> | undefined =
      userId && mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : undefined;

    // If userId was not passed in token, attempt lookup by user email
    if (!safeUserId && resolvedEmail) {
      try {
        const foundUser = await UserModel.findOne({ email: resolvedEmail }).lean();
        if (foundUser && foundUser._id) {
          safeUserId = foundUser._id as InstanceType<typeof mongoose.Types.ObjectId>;
        }
      } catch {
        // Continue with undefined safeUserId
      }
    }

    const newDoc = await OrderModel.create({
      orderNumber,
      userId: safeUserId,
      items: sanitizedItems,
      shippingAddress: sanitizedAddress,
      paymentInfo: sanitizedPayment,
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
    items: sanitizedItems,
    shippingAddress: sanitizedAddress,
    paymentInfo: sanitizedPayment,
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
  userEmail?: string,
  isAdmin: boolean = false
): Promise<IOrder[]> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    if (isAdmin) {
      const allDocs = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
      return allDocs.map(sanitizeOrderDoc);
    }

    const orConditions: Array<Record<string, unknown>> = [];
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
    }
    if (userEmail) {
      orConditions.push({ "shippingAddress.email": userEmail.toLowerCase() });
    }

    if (orConditions.length === 0) {
      return [];
    }

    const docs = await OrderModel.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
    return docs.map(sanitizeOrderDoc);
  }

  // Memory fallback
  if (isAdmin) return memoryOrders;
  return memoryOrders.filter(
    (o) =>
      (userId && o.userId === userId) ||
      (userEmail && o.shippingAddress?.email?.toLowerCase() === userEmail.toLowerCase())
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
