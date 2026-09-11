import { useState, useMemo, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  shippingAddressSchema,
  ShippingAddressFormValues,
} from "@/lib/validations/checkout.schema";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ICouponRule, IOrder } from "@/types/order.types";
import { toast } from "sonner";

export type CheckoutStep =
  | "CART"
  | "SHIPPING"
  | "PAYMENT"
  | "AWAITING_APPROVAL"
  | "SUCCESS";

export interface IUseCheckoutReturn {
  step: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
  shippingForm: UseFormReturn<ShippingAddressFormValues>;
  couponInput: string;
  setCouponInput: (code: string) => void;
  appliedCoupon: ICouponRule | null;
  applyCoupon: () => void;
  removeCoupon: () => void;
  paymentMethod: "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW";
  setPaymentMethod: (method: "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW") => void;
  subtotal: number;
  couponSavings: number;
  finalTotal: number;
  isProcessing: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  proceedToShipping: () => void;
  submitShippingAddress: (data: ShippingAddressFormValues) => void;
  placeOrder: () => void;
  activeOrder: IOrder | null;
  resetCheckout: () => void;
}

export function useCheckout(onClose?: () => void): IUseCheckoutReturn {
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<CheckoutStep>("CART");
  const [couponInput, setCouponInput] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<ICouponRule | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW"
  >("CREDIT_CARD");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const { cart, clearCart } = useCartStore();
  const { addOrder, validateCoupon, orders } = useOrderStore();

  const shippingForm = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
    },
  });

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.finalPrice, 0);
  }, [cart]);

  const couponSavings = useMemo(() => {
    if (!appliedCoupon) return 0;
    return Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
  }, [subtotal, appliedCoupon]);

  const finalTotal = Math.max(0, subtotal - couponSavings);

  const activeOrder = useMemo(() => {
    if (!submittedOrderId) return null;
    return orders.find((o) => o.id === submittedOrderId) || null;
  }, [orders, submittedOrderId]);

  // Auto-fill user contact info if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const vals = shippingForm.getValues();
      if (!vals.fullName && user.name) {
        shippingForm.setValue("fullName", user.name);
      }
      if (!vals.email && user.email) {
        shippingForm.setValue("email", user.email);
      }
    }
  }, [isAuthenticated, user, shippingForm]);

  // Pure derived state: Gated to CART if unauthenticated, transitions to SUCCESS when Curator accepts
  const effectiveStep: CheckoutStep =
    !isAuthenticated && step !== "CART"
      ? "CART"
      : step === "AWAITING_APPROVAL" && activeOrder?.status === "APPROVED"
      ? "SUCCESS"
      : step;

  const applyCoupon = () => {
    if (!couponInput.trim()) return;
    const rule = validateCoupon(couponInput);
    if (rule) {
      setAppliedCoupon(rule);
      toast.success(`Coupon "${rule.code}" Applied!`, {
        description: `Saved ${rule.discountPercentage}% (${rule.description})`,
      });
    } else {
      toast.error("Invalid Coupon Code", {
        description: "Try codes: KRISHNAVIP (25% off) or AURELIA10 (10% off).",
      });
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const proceedToShipping = () => {
    if (cart.length === 0) {
      toast.error("Your vault cart is empty");
      return;
    }
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      toast.info("Please sign in first to complete your order", {
        description: "Your reserved diamonds remain saved in your vault cart.",
      });
      return;
    }
    setStep("SHIPPING");
  };

  const submitShippingAddress = () => {
    setStep("PAYMENT");
    toast.success("Shipping address verified");
  };

  const placeOrder = async () => {
    setIsProcessing(true);

    const shippingValues = shippingForm.getValues();
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const orderPayload = {
      items: [...cart],
      shippingAddress: shippingValues,
      paymentInfo: {
        method: paymentMethod,
        couponCode: appliedCoupon?.code,
        couponDiscountPercentage: appliedCoupon?.discountPercentage || 0,
      },
      subtotal,
      couponDiscount: couponSavings,
      totalAmount: finalTotal,
      status: "PENDING_APPROVAL" as const,
    };

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = typeof window !== "undefined" ? localStorage.getItem("diamond_auth_token") : null;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const createdOrder: IOrder = json.data;
        addOrder(createdOrder);
        setSubmittedOrderId(createdOrder.id || createdOrder.orderNumber || orderId);
      } else {
        const fallbackOrder: IOrder = {
          ...orderPayload,
          id: orderId,
          orderNumber: orderId,
          createdAt: new Date().toISOString(),
        };
        addOrder(fallbackOrder);
        setSubmittedOrderId(orderId);
      }
    } catch {
      const fallbackOrder: IOrder = {
        ...orderPayload,
        id: orderId,
        orderNumber: orderId,
        createdAt: new Date().toISOString(),
      };
      addOrder(fallbackOrder);
      setSubmittedOrderId(orderId);
    } finally {
      clearCart();
      setIsProcessing(false);
      setStep("AWAITING_APPROVAL");
    }
  };

  const resetCheckout = () => {
    setStep("CART");
    setAppliedCoupon(null);
    setCouponInput("");
    setSubmittedOrderId(null);
    shippingForm.reset();
    if (onClose) onClose();
  };

  return {
    step: effectiveStep,
    setStep,
    shippingForm,
    couponInput,
    setCouponInput,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    couponSavings,
    finalTotal,
    isProcessing,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAuthenticated,
    proceedToShipping,
    submitShippingAddress,
    placeOrder,
    activeOrder,
    resetCheckout,
  };
}
