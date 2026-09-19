"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { IDiamond } from "@/types/diamond.types";
import { IOrder, PaymentMethod } from "@/types/order.types";
import { IAdminCreateOrderInput, IAdminCreateOrderResponse } from "@/types/admin.types";

export interface ISelectedOrderItem {
  diamond: IDiamond;
  quantity: number;
}

export interface IInquiryPrefill {
  id?: string;
  inquiryNumber?: string;
  fullName: string;
  email: string;
  phone?: string;
}

export function useAdminCreateOrder(onOrderCreated?: (order: IOrder) => void) {
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [street, setStreet] = useState<string>("Curator Vault Custody");
  const [city, setCity] = useState<string>("Geneva");
  const [state, setState] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VAULT_ESCROW");
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [inquiryId, setInquiryId] = useState<string>("");
  const [linkedInquiryNumber, setLinkedInquiryNumber] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<Map<string, ISelectedOrderItem>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prefill when launching from an inquiry
  const prefillFromInquiry = useCallback((inquiry: IInquiryPrefill) => {
    setClientName(inquiry.fullName || "");
    setClientEmail(inquiry.email || "");
    setClientPhone(inquiry.phone || "");
    setInquiryId(inquiry.id || "");
    setLinkedInquiryNumber(inquiry.inquiryNumber || "");
    setAdminNotes(
      inquiry.inquiryNumber
        ? `Commissioned directly from Client Inquiry #${inquiry.inquiryNumber}`
        : "Commissioned directly from client consultation"
    );
  }, []);

  // Diamond toggle / quantity handlers
  const toggleSelectDiamond = useCallback((diamond: IDiamond) => {
    const key: string = String(diamond._id || diamond.id || "");
    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, { diamond, quantity: 1 });
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((diamondId: string, quantity: number) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      const existing = next.get(diamondId);
      if (!existing) return prev;
      if (quantity <= 0) {
        next.delete(diamondId);
      } else {
        next.set(diamondId, { ...existing, quantity });
      }
      return next;
    });
  }, []);

  const removeDiamond = useCallback((diamondId: string) => {
    setSelectedItems((prev) => {
      const next = new Map(prev);
      next.delete(diamondId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Map());
  }, []);

  // Computed Financials
  const itemsList = useMemo(() => Array.from(selectedItems.values()), [selectedItems]);

  const subtotal = useMemo(() => {
    return itemsList.reduce((sum, item) => sum + item.diamond.finalPrice * item.quantity, 0);
  }, [itemsList]);

  const safeDiscountPercentage = useMemo(() => {
    return Math.min(Math.max(0, Number(discountPercentage) || 0), 90);
  }, [discountPercentage]);

  const concessionSavings = useMemo(() => {
    return Math.round(subtotal * (safeDiscountPercentage / 100));
  }, [subtotal, safeDiscountPercentage]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - concessionSavings);
  }, [subtotal, concessionSavings]);

  const reset = useCallback(() => {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setStreet("Curator Vault Custody");
    setCity("Geneva");
    setState("");
    setPostalCode("");
    setCountry("India");
    setPaymentMethod("VAULT_ESCROW");
    setDiscountPercentage(0);
    setAdminNotes("");
    setInquiryId("");
    setLinkedInquiryNumber("");
    setSelectedItems(new Map());
    setIsSubmitting(false);
    setErrorMessage(null);
  }, []);

  const submitOrder = useCallback(async (): Promise<IOrder | null> => {
    setErrorMessage(null);

    if (!clientName.trim()) {
      const err = "Please provide the client's full name.";
      setErrorMessage(err);
      toast.error(err);
      return null;
    }

    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      const err = "Please provide a valid client email address.";
      setErrorMessage(err);
      toast.error(err);
      return null;
    }

    if (itemsList.length === 0) {
      const err = "Please select at least one certified diamond specimen for this commission.";
      setErrorMessage(err);
      toast.error(err);
      return null;
    }

    setIsSubmitting(true);

    try {
      const payload: IAdminCreateOrderInput = {
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone.trim(),
        street: street.trim() || "Curator Vault Custody",
        city: city.trim() || "Geneva",
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim() || "India",
        items: itemsList.map((item) => ({
          diamondId: String(item.diamond._id || item.diamond.id || ""),
          quantity: item.quantity,
        })),
        paymentMethod,
        discountPercentage: safeDiscountPercentage,
        adminNotes: adminNotes.trim(),
        inquiryId: inquiryId ? inquiryId : undefined,
      };

      const res = await fetch("/api/admin/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: IAdminCreateOrderResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        const errorText = data.error || "Failed to create client order in vault records.";
        setErrorMessage(errorText);
        toast.error(errorText);
        setIsSubmitting(false);
        return null;
      }

      toast.success(
        `VIP Order #${data.data.orderNumber || data.data.id} successfully generated and pre-approved!`
      );
      reset();
      if (onOrderCreated) {
        onOrderCreated(data.data);
      }
      setIsSubmitting(false);
      return data.data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error creating client order.";
      setErrorMessage(msg);
      toast.error(msg);
      setIsSubmitting(false);
      return null;
    }
  }, [
    clientName,
    clientEmail,
    clientPhone,
    street,
    city,
    state,
    postalCode,
    country,
    itemsList,
    paymentMethod,
    safeDiscountPercentage,
    adminNotes,
    inquiryId,
    reset,
    onOrderCreated,
  ]);

  return {
    clientName,
    setClientName,
    clientEmail,
    setClientEmail,
    clientPhone,
    setClientPhone,
    street,
    setStreet,
    city,
    setCity,
    state,
    setState,
    postalCode,
    setPostalCode,
    country,
    setCountry,
    paymentMethod,
    setPaymentMethod,
    discountPercentage,
    setDiscountPercentage,
    adminNotes,
    setAdminNotes,
    inquiryId,
    linkedInquiryNumber,
    selectedItems,
    itemsList,
    toggleSelectDiamond,
    updateQuantity,
    removeDiamond,
    clearSelection,
    subtotal,
    safeDiscountPercentage,
    concessionSavings,
    finalTotal,
    isSubmitting,
    errorMessage,
    prefillFromInquiry,
    submitOrder,
    reset,
  };
}
