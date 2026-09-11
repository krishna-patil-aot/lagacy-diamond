import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IOrder, ICouponRule } from "@/types/order.types";
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
  setCurrentOrderId: (id: string | null) => void;
  getOrderById: (id: string) => IOrder | null;
  validateCoupon: (code: string) => ICouponRule | null;
}

export const useOrderStore = create<IOrderStore>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      currentOrderId: null,

      addOrder: (order: IOrder) => {
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrderId: order.id,
        }));
        toast.success("Diamond Order Submitted!", {
          description: "Request sent to Admin Panel for Vault Curator approval.",
        });
      },

      approveOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "APPROVED",
                  approvedAt: new Date().toISOString(),
                }
              : o
          ),
        }));
        toast.success("Order Approved by Vault Curator!", {
          description: "Armored insured dispatch scheduled. Client notified.",
        });
      },

      rejectOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" } : o
          ),
        }));
        toast.error("Order Cancelled by Vault Curator.");
      },

      setCurrentOrderId: (id: string | null) => set({ currentOrderId: id }),

      getOrderById: (id: string) => {
        return get().orders.find((o) => o.id === id) || null;
      },

      validateCoupon: (code: string) => {
        const clean = code.trim().toUpperCase();
        return AVAILABLE_COUPONS.find((c) => c.code === clean) || null;
      },
    }),
    {
      name: "diamond_orders_store_v2",
      onRehydrateStorage: () => (state) => {
        if (state && (!state.orders || state.orders.length === 0)) {
          state.orders = INITIAL_ORDERS;
        }
      },
    }
  )
);
