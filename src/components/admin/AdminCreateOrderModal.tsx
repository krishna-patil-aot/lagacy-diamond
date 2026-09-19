"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  useAdminCreateOrder,
  IInquiryPrefill,
} from "@/hooks/useAdminCreateOrder";
import { useAdminDiamonds } from "@/hooks/useAdminDiamonds";
import { IOrder, PaymentMethod } from "@/types/order.types";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  Search,
  Plus,
  Minus,
  Trash2,
  Lock,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Building2,
  Shield,
  Loader2,
  CheckCircle2,
  Diamond,
  X,
} from "lucide-react";

interface AdminCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillInquiry?: IInquiryPrefill | null;
  onOrderCreated?: (order: IOrder) => void;
}

export function AdminCreateOrderModal({
  isOpen,
  onClose,
  prefillInquiry,
  onOrderCreated,
}: AdminCreateOrderModalProps) {
  const {
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
    linkedInquiryNumber,
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
  } = useAdminCreateOrder((order) => {
    if (onOrderCreated) {
      onOrderCreated(order);
    }
    onClose();
  });

  const { diamonds, isLoading: isLoadingDiamonds } = useAdminDiamonds();
  const [diamondSearch, setDiamondSearch] = useState<string>("");
  const [showAddressFields, setShowAddressFields] = useState<boolean>(false);

  // Auto-fill when prefillInquiry is provided
  useEffect(() => {
    if (isOpen && prefillInquiry) {
      prefillFromInquiry(prefillInquiry);
    }
  }, [isOpen, prefillInquiry, prefillFromInquiry]);

  // Reset when closing
  const handleClose = () => {
    reset();
    setDiamondSearch("");
    setShowAddressFields(false);
    onClose();
  };

  // Filter available diamonds by search query
  const filteredAvailableDiamonds = useMemo(() => {
    const q = diamondSearch.trim().toLowerCase();
    if (!q) return diamonds.slice(0, 15);

    return diamonds
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.sku.toLowerCase().includes(q) ||
          d.shape.toLowerCase().includes(q) ||
          d.color.toLowerCase().includes(q) ||
          d.clarity.toLowerCase().includes(q) ||
          String(d.carat).includes(q)
      )
      .slice(0, 15);
  }, [diamonds, diamondSearch]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-[calc(100%-1.5rem)] max-h-[92dvh] overflow-y-auto p-4 sm:p-6 md:p-8 bg-white border border-stone-200 shadow-2xl rounded-2xl">
        {/* Modal Header with Luxury Gold Accent */}
        <DialogHeader className="border-b border-stone-100 pb-4 pr-10 sm:pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 shrink-0">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
            </span>
            <DialogTitle className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-tight">
              Curator Commission Order
            </DialogTitle>
            {linkedInquiryNumber ? (
              <Badge variant="gold" className="text-[11px] gap-1 font-mono">
                <FileText className="h-3 w-3" /> Inquiry #{linkedInquiryNumber}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-mono text-stone-600 bg-stone-50">
                VIP Private Mandate
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-stone-500 mt-1 leading-relaxed">
            Generate an official certified acquisition for a private client. The order will be immediately authorized, registered in the vault ledger, and linked to the client&apos;s account.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <X className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-6 py-3">
          {/* Section 1: Client Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-600" />
                <span>1. Client Credentials</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddressFields(!showAddressFields)}
                className="text-xs text-amber-700 hover:text-amber-900 font-medium underline transition-colors"
              >
                {showAddressFields ? "Hide Custom Address" : "+ Custom Armored Address"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600">Client Full Name *</label>
                <div className="relative">
                  <Input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Lord Alistair Vance"
                    className="text-xs h-9 pl-8 bg-stone-50 border-stone-200"
                    required
                  />
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600">Client Email *</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@luxuryvault.ch"
                    className="text-xs h-9 pl-8 bg-stone-50 border-stone-200 font-mono"
                    required
                  />
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-stone-600">Client Phone (Optional)</label>
                <div className="relative">
                  <Input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+41 22 710 8800"
                    className="text-xs h-9 pl-8 bg-stone-50 border-stone-200 font-mono"
                  />
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                </div>
              </div>
            </div>

            {/* Collapsible Delivery Address */}
            {showAddressFields && (
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-3 transition-all animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <MapPin className="h-3.5 w-3.5 text-stone-500" />
                  <span>Armored Escort Destination Address</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] text-stone-500">Street & Private Suite</label>
                    <Input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Rue du Rhône 42, Private Suite 8"
                      className="text-xs h-8 bg-white border-stone-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-500">City</label>
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Geneva"
                      className="text-xs h-8 bg-white border-stone-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-500">State / Canton</label>
                    <Input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Geneva"
                      className="text-xs h-8 bg-white border-stone-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-500">Postal Code</label>
                    <Input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="1204"
                      className="text-xs h-8 bg-white border-stone-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-500">Country</label>
                    <Input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Switzerland"
                      className="text-xs h-8 bg-white border-stone-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Certified Gemstone Selection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Diamond className="h-3.5 w-3.5 text-amber-600" />
                <span>2. Select Gemstone Specimens ({itemsList.length} Selected)</span>
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Search SKU, carat, shape..."
                  value={diamondSearch}
                  onChange={(e) => setDiamondSearch(e.target.value)}
                  className="h-8 pl-8 text-xs bg-stone-50 border-stone-200"
                />
                {diamondSearch && (
                  <button
                    type="button"
                    onClick={() => setDiamondSearch("")}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Selected Diamonds Strip */}
            {itemsList.length > 0 && (
              <div className="rounded-xl border border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>Allocated for Commission:</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-1.5">
                  {itemsList.map(({ diamond, quantity }) => {
                    const diaKey: string = String(diamond._id || diamond.id || "");
                    return (
                      <div
                        key={diaKey}
                        className="flex items-center justify-between gap-2 bg-white/90 rounded-lg p-2 border border-amber-200/60 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative h-9 w-9 rounded-md overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                            <Image
                              src={diamond.images?.[0] || "/images/diamonds/round.jpg"}
                              alt={diamond.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 truncate text-[11px] sm:text-xs">
                              {diamond.name}
                            </p>
                            <p className="text-[10px] text-stone-500 font-mono truncate">
                              {diamond.carat}ct • {diamond.color} • {diamond.clarity} • SKU: {diamond.sku}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-stone-900 text-xs">
                            {formatPrice(diamond.finalPrice * quantity)}
                          </span>
                          <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(diaKey, quantity - 1)}
                              className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                              title="Decrease Quantity"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="px-1.5 text-[11px] font-mono font-bold">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(diaKey, quantity + 1)}
                              className="p-1 hover:bg-stone-200 text-stone-600 transition-colors"
                              title="Increase Quantity"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDiamond(diaKey)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Remove from Order"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory Picker Table / List */}
            <div className="rounded-xl border border-stone-200 overflow-hidden bg-white max-h-56 overflow-y-auto">
              {isLoadingDiamonds ? (
                <div className="p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  <span>Loading vault inventory catalogue...</span>
                </div>
              ) : filteredAvailableDiamonds.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500">
                  No diamond lots match your search query &quot;{diamondSearch}&quot;.
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {filteredAvailableDiamonds.map((diamond) => {
                    const diaKey: string = String(diamond._id || diamond.id || "");
                    const isSelected = itemsList.some(
                      (item) => String(item.diamond._id || item.diamond.id || "") === diaKey
                    );
                    return (
                      <div
                        key={diaKey}
                        className={`flex items-center justify-between p-2.5 hover:bg-stone-50/80 transition-colors ${
                          isSelected ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative h-8 w-8 rounded bg-stone-100 shrink-0 border border-stone-200 overflow-hidden">
                            <Image
                              src={diamond.images?.[0] || "/images/diamonds/round.jpg"}
                              alt={diamond.name}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-stone-900 text-xs truncate">
                                {diamond.name}
                              </span>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 font-mono">
                                {diamond.shape}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                              {diamond.carat}ct • Color: {diamond.color} • Clarity: {diamond.clarity} • Cut: {diamond.cut}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="font-mono font-bold text-xs text-stone-900">
                              {formatPrice(diamond.finalPrice)}
                            </div>
                            {diamond.stockQuantity !== undefined && (
                              <div className="text-[9px] font-mono text-emerald-700">
                                {diamond.stockQuantity} in vault
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "luxury" : "outline"}
                            onClick={() => toggleSelectDiamond(diamond)}
                            className="h-7 px-2.5 text-[11px] gap-1 shadow-2xs whitespace-nowrap"
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Payment & Concession Terms */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-amber-600" />
              <span>3. Settlement Terms & Concession</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-stone-600">Settlement Channel</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "VAULT_ESCROW", label: "Vault Escrow", icon: Shield },
                      { id: "WIRE_TRANSFER", label: "Bank Wire", icon: Building2 },
                      { id: "CREDIT_CARD", label: "Card / Amex", icon: CreditCard },
                    ] as const
                  ).map((method) => {
                    const Icon = method.icon;
                    const isActive = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                          isActive
                            ? "border-amber-600 bg-amber-500/10 text-amber-950 font-semibold shadow-2xs ring-1 ring-amber-500/20"
                            : "border-stone-200 bg-stone-50/60 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        <Icon className={`h-4 w-4 mb-1 ${isActive ? "text-amber-700" : "text-stone-400"}`} />
                        <span className="text-[10px] text-center leading-tight">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Curator Concession (Discount) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="font-medium text-stone-600">Curator Concession / Privilege</label>
                  <span className="font-mono font-bold text-amber-800">{safeDiscountPercentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={discountPercentage || ""}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="h-8 text-xs font-mono w-20 bg-stone-50 border-stone-200 text-center"
                  />
                  <div className="flex items-center gap-1 flex-1">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercentage(pct)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-mono border transition-colors ${
                          safeDiscountPercentage === pct
                            ? "bg-amber-600 text-white border-amber-600 font-bold"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Catalogue Value ({itemsList.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>

              {safeDiscountPercentage > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Curator Concession ({safeDiscountPercentage}%)
                  </span>
                  <span className="font-mono">-{formatPrice(concessionSavings)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-900 font-bold text-sm">
                <span className="font-serif">Authorized Settlement Total</span>
                <span className="font-mono text-base text-amber-900">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Curator Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-stone-600 flex items-center gap-1">
              <FileText className="h-3 w-3 text-stone-400" />
              <span>Curator Vault Ledger Notes (Internal Record &amp; Client Dossier)</span>
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Authorized under telephone mandate following private viewing. Certified gemological dossiers dispatched."
              className="w-full text-xs rounded-lg border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
            <Lock className="h-3.5 w-3.5 text-amber-600" />
            <span>Pre-approved with cryptographic vault timestamp</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="luxury"
              size="sm"
              onClick={() => submitOrder()}
              disabled={isSubmitting || itemsList.length === 0}
              className="text-xs h-9 px-5 gap-2 shadow-md whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Authorizing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authorize &amp; Generate Order ({formatPrice(finalTotal)})</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
