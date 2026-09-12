import { create } from "zustand";
import { IOrder, ICouponRule, OrderStatus } from "@/types/order.types";
import { broadcastOrderEvent, ORDER_EVENTS } from "@/lib/order-events";
import { toast } from "sonner";

export const AVAILABLE_COUPONS: ICouponRule[] = [
  {
    code: "KRISHNAVIP",
    discountPercentage: 25,
    description: "25% VIP Privilege Discount (Courtesy of Krishna Patil)",
  },
  {
    code: "AURELIA10",
    discountPercentage: 10,
    description: "10% Welcome Vault Offering",
  },
  {
    code: "LUXURY20",
    discountPercentage: 20,
    description: "20% High-Jewelry Connoisseur Privilege",
  },
];

export const INITIAL_ORDERS: IOrder[] = [];

interface IOrderStore {
  orders: IOrder[];
  currentOrderId: string | null;
  addOrder: (order: IOrder) => void;
  approveOrder: (orderId: string) => void;
  rejectOrder: (orderId: string) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    extra?: {
      carrier?: string;
      trackingNumber?: string;
      note?: string;
      approvedAt?: string;
    }
  ) => void;
  setCurrentOrderId: (id: string | null) => void;
  getOrderById: (id: string) => IOrder | null;
  validateCoupon: (code: string) => ICouponRule | null;
  clearOrders: () => void;
}

// Purge any stale client-side order caches left over from previous local testing
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("diamond_orders_store_v2");
    localStorage.removeItem("diamond_orders_store");
  } catch {
    // Ignore in restricted environments
  }
}

export const useOrderStore = create<IOrderStore>()((set, get) => ({
  orders: INITIAL_ORDERS,
  currentOrderId: null,

  addOrder: (order: IOrder) => {
    set((state) => {
      const orderKey = (order.orderNumber || order.id || "").toUpperCase();
      const filtered = state.orders.filter(
        (o) => (o.orderNumber || o.id || "").toUpperCase() !== orderKey
      );
      return {
        orders: [order, ...filtered],
        currentOrderId: order.id,
      };
    });

    broadcastOrderEvent(ORDER_EVENTS.ORDER_PLACED, order.id, order.orderNumber);

    toast.success("Diamond Order Submitted!", {
      description: "Request sent to Admin Panel for Vault Curator approval.",
    });
  },

  approveOrder: (orderId: string) => {
    const approvedAt = new Date().toISOString();
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? {
              ...o,
              status: "APPROVED",
              approvedAt,
            }
          : o
      ),
    }));

    broadcastOrderEvent(ORDER_EVENTS.ORDER_STATUS_CHANGED, orderId);

    toast.success("Order Approved by Vault Curator!", {
      description: "Armored insured dispatch scheduled. Client notified.",
    });
  },

  rejectOrder: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId || o.orderNumber === orderId
          ? { ...o, status: "CANCELLED" }
          : o
      ),
    }));

    broadcastOrderEvent(ORDER_EVENTS.ORDER_CANCELLED, orderId);

    toast.error("Order Cancelled by Vault Curator.");
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, extra) => {
    const normalizedTarget = orderId.toUpperCase();
    set((state) => ({
      orders: state.orders.map((o) => {
        const matches =
          (o.id && o.id.toUpperCase() === normalizedTarget) ||
          (o.orderNumber && o.orderNumber.toUpperCase() === normalizedTarget);

        if (!matches) return o;

        return {
          ...o,
          status,
          approvedAt:
            status === "APPROVED"
              ? extra?.approvedAt || new Date().toISOString()
              : o.approvedAt,
          trackingInfo: extra?.carrier || extra?.trackingNumber
            ? {
                carrier: extra.carrier || o.trackingInfo?.carrier || "Brink's Global Armored Services",
                trackingNumber: extra.trackingNumber || o.trackingInfo?.trackingNumber || `BRK-${o.orderNumber}`,
                vaultOrigin: o.trackingInfo?.vaultOrigin || "Geneva Central Foundry Vault",
                transitType: o.trackingInfo?.transitType || "ARMORED_GROUND",
                biometricSignatureRequired: true,
                estimatedDeliveryDate: o.trackingInfo?.estimatedDeliveryDate,
                actualDeliveryDate: status === "DELIVERED" ? new Date().toISOString() : undefined,
              }
            : o.trackingInfo,
        };
      }),
    }));

    broadcastOrderEvent(ORDER_EVENTS.ORDER_STATUS_CHANGED, orderId);
  },

  setCurrentOrderId: (id: string | null) => set({ currentOrderId: id }),

  getOrderById: (id: string) => {
    const target = id.toUpperCase();
    return (
      get().orders.find(
        (o) =>
          (o.id && o.id.toUpperCase() === target) ||
          (o.orderNumber && o.orderNumber.toUpperCase() === target)
      ) || null
    );
  },

  validateCoupon: (code: string) => {
    const clean = code.trim().toUpperCase();
    return AVAILABLE_COUPONS.find((c) => c.code === clean) || null;
  },

  clearOrders: () => set({ orders: [], currentOrderId: null }),
}));
