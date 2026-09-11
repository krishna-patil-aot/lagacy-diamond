"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useCheckout } from "@/hooks/useCheckout";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AVAILABLE_COUPONS } from "@/store/useOrderStore";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Tag,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Lock,
} from "lucide-react";
import { LoginRequiredModal } from "@/components/common/LoginRequiredModal";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, removeFromCart } = useCartStore();
  const { user } = useAuthStore();

  const {
    step,
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
  } = useCheckout(onClose);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = shippingForm;

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetCheckout();
      }}
      className="max-w-2xl"
    >
      {/* Step Indicator Header */}
      <div className="border-b border-zinc-800 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4" />
            <span>Private Vault Checkout</span>
          </span>
          <span className="text-xs font-mono text-zinc-500">
            {step === "CART" && "Step 1/3: Selection"}
            {step === "SHIPPING" && "Step 2/3: Insured Delivery"}
            {step === "PAYMENT" && "Step 3/3: Valuation & Privilege"}
            {step === "AWAITING_APPROVAL" && "Verification"}
            {step === "SUCCESS" && "Vault Confirmed"}
          </span>
        </div>
      </div>

      {/* STEP 1: CART ITEMS REVIEW */}
      {step === "CART" && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white font-serif">
            Your Private Vault Selection ({cart.length})
          </h2>

          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ShoppingBag className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="text-sm text-zinc-400">Your vault reservation list is empty.</p>
              <Button variant="luxury" size="sm" onClick={onClose}>
                Browse Certified Diamonds
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cart.map((diamond) => (
                <div
                  key={diamond._id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex-shrink-0">
                      <Image
                        src={diamond.images[0] || ""}
                        alt={diamond.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white truncate max-w-[220px]">
                        {diamond.name}
                      </h4>
                      <div className="text-[11px] font-mono text-amber-300">
                        {diamond.carat} ct • {diamond.shape} • {diamond.color} / {diamond.clarity}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold font-mono text-white">
                      {formatPrice(diamond.finalPrice)}
                    </span>
                    <button
                      onClick={() => {
                        removeFromCart(diamond._id);
                        toast.info("Removed from Vault Reservation");
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="border-t border-zinc-800 pt-4 space-y-4">
              {!isAuthenticated && (
                <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Client sign-in required to access insured armored delivery & payment.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="underline underline-offset-2 font-semibold hover:text-white shrink-0 ml-2 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Total Lot Valuation:</span>
                <span className="text-xl font-bold font-mono text-amber-300">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button
                variant="luxury"
                className="w-full justify-center text-sm h-11"
                onClick={proceedToShipping}
              >
                {!isAuthenticated ? (
                  <>
                    <Lock className="h-4 w-4 mr-2 text-amber-400" />
                    Sign In & Proceed to Delivery
                  </>
                ) : (
                  <>
                    Proceed to Insured Delivery Address
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SHIPPING ADDRESS */}
      {step === "SHIPPING" && (
        <form onSubmit={handleSubmit(submitShippingAddress)} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-serif">
              Insured Armored Delivery Details
            </h2>
            <button
              type="button"
              onClick={() => setStep("CART")}
              className="text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">Full Legal Name *</label>
              <Input placeholder="Lady Victoria Kensington" {...register("fullName")} error={errors.fullName?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">Secure Tracking Email *</label>
              <Input type="email" placeholder="client@estate.luxury" {...register("email")} error={errors.email?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">Contact Telephone (For Delivery Protocol) *</label>
              <Input placeholder="+1 (555) 019-2831" {...register("phone")} error={errors.phone?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">Country *</label>
              <Input placeholder="United States" {...register("country")} error={errors.country?.message} />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-zinc-300">Street & Vault Address *</label>
            <Input placeholder="740 Park Avenue, Penthouse B" {...register("street")} error={errors.street?.message} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">City *</label>
              <Input placeholder="New York" {...register("city")} error={errors.city?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">State / Region *</label>
              <Input placeholder="NY" {...register("state")} error={errors.state?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-zinc-300">Postal / ZIP *</label>
              <Input placeholder="10021" {...register("postalCode")} error={errors.postalCode?.message} />
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <Button type="submit" variant="luxury" className="w-full justify-center text-sm h-11">
              Proceed to Valuation & Payment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: PAYMENT & DISCOUNT COUPON */}
      {step === "PAYMENT" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-serif">
              Payment & Privilege Discounts
            </h2>
            <button
              onClick={() => setStep("SHIPPING")}
              className="text-xs text-zinc-400 hover:text-amber-300 flex items-center gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>

          {/* Coupon Code Input & Chips */}
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                <Tag className="h-3.5 w-3.5" />
                <span>Apply Privilege Discount Coupon</span>
              </span>
              {appliedCoupon && (
                <Badge variant="gold" className="text-[10px]">
                  {appliedCoupon.discountPercentage}% OFF APPLIED
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon (e.g. KRISHNAVIP)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="font-mono"
              />
              {appliedCoupon ? (
                <Button variant="outline" size="sm" onClick={removeCoupon}>
                  Remove
                </Button>
              ) : (
                <Button variant="luxury" size="sm" onClick={applyCoupon}>
                  Apply
                </Button>
              )}
            </div>

            {/* Quick Coupon Helper Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-zinc-500 font-mono">Quick Codes:</span>
              {AVAILABLE_COUPONS.map((coupon) => (
                <button
                  key={coupon.code}
                  type="button"
                  onClick={() => {
                    setCouponInput(coupon.code);
                    const rule = AVAILABLE_COUPONS.find((c) => c.code === coupon.code);
                    if (rule) {
                      toast.info(`Selected "${coupon.code}" - Click Apply to save ${coupon.discountPercentage}%`);
                    }
                  }}
                  className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-zinc-300 hover:border-amber-400 hover:text-amber-300 font-mono transition-colors"
                >
                  {coupon.code} (-{coupon.discountPercentage}%)
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-zinc-300 block">
              Payment Protocol
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "CREDIT_CARD", label: "Encrypted Card" },
                { id: "WIRE_TRANSFER", label: "Bank Wire / SWIFT" },
                { id: "VAULT_ESCROW", label: "Vault Escrow" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id as "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW")}
                  className={`rounded-lg border p-3 text-center text-xs font-medium transition-all ${
                    paymentMethod === id
                      ? "border-amber-400 bg-amber-400/15 text-amber-200"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Lot Subtotal:</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            {couponSavings > 0 && (
              <div className="flex justify-between text-amber-300 font-semibold">
                <span>Coupon Privilege Savings ({appliedCoupon?.code}):</span>
                <span className="font-mono">-{formatPrice(couponSavings)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>Armored & Insured Transit:</span>
              <span className="font-mono text-emerald-400">COMPLIMENTARY</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2">
              <span>Final Settlement Amount:</span>
              <span className="font-mono text-lg text-emerald-400">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          <Button
            variant="luxury"
            className="w-full justify-center text-sm h-11"
            onClick={placeOrder}
            isLoading={isProcessing}
          >
            Authorize & Submit Order to Vault
          </Button>
        </div>
      )}

      {/* STEP 4: AWAITING ADMIN APPROVAL */}
      {step === "AWAITING_APPROVAL" && activeOrder && (
        <div className="py-6 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
            <Clock className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="gold">ORDER #{activeOrder.id}</Badge>
              <span className="rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-mono font-medium">
                Sent to Admin
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              Order Transmitted to Vault Admin
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your diamond acquisition request has been securely transmitted to the Lead Gemologist & Vault Curator in the Admin Portal for physical lot verification.
            </p>
          </div>

          {/* Detailed Order Status Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between text-zinc-400">
              <span>Order Reference:</span>
              <span className="font-mono text-zinc-200 font-semibold">#{activeOrder.id}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Settlement Total:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatPrice(activeOrder.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Transit Recipient:</span>
              <span className="text-zinc-200 truncate max-w-[200px]">
                {activeOrder.shippingAddress.fullName} ({activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state})
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-400 border-t border-zinc-800/80 pt-2">
              <span>Curator Pipeline:</span>
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-mono text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
                Awaiting Admin Acceptance
              </span>
            </div>
          </div>

          {/* Routing information & Client Actions */}
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4 max-w-md mx-auto space-y-3 text-center">
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Order acceptance is managed through the <span className="text-amber-300 font-semibold">Curator Admin Portal</span>. Once the administrator approves the request, transit dispatch is immediately sealed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <Link href="/orders" onClick={resetCheckout} className="w-full sm:w-auto">
                <Button
                  variant="luxury"
                  size="sm"
                  className="w-full sm:w-auto px-6 text-xs"
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                  Track in My Orders
                </Button>
              </Link>

              {user?.role === "ADMIN" && (
                <Link href="/admin" onClick={resetCheckout} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs text-amber-300 hover:text-white border-amber-500/40 bg-amber-500/10"
                  >
                    <ArrowRight className="h-3.5 w-3.5 mr-1" />
                    Approve in Admin Portal
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full sm:w-auto text-xs text-zinc-400 hover:text-zinc-200"
                onClick={resetCheckout}
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: ORDER PLACED SUCCESS */}
      {step === "SUCCESS" && (
        <div className="py-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <Badge variant="success">ORDER CONFIRMED & APPROVED</Badge>
            <h2 className="text-2xl font-serif font-bold text-white">
              Vault Order Placed Successfully!
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Order <span className="font-mono text-amber-300 font-semibold">#{activeOrder?.id}</span> has been formally accepted by the Diamond Curator. Your gemstones are now sealed for armored insured transit.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Settlement Total:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatPrice(activeOrder?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Destination:</span>
              <span className="text-zinc-200 truncate max-w-[220px]">
                {activeOrder?.shippingAddress.street}, {activeOrder?.shippingAddress.city}
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Verification Status:</span>
              <span className="text-emerald-400 font-mono">GIA Inscription Confirmed</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/orders" onClick={resetCheckout} className="w-full sm:w-auto">
              <Button variant="luxury" size="md" className="w-full sm:w-auto px-6">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Live Transit Tracking
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={resetCheckout} className="w-full sm:w-auto px-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Continue Exploring Vault
            </Button>
          </div>
        </div>
      )}

      {/* Login Required Authentication Modal for Order Workflow */}
      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        cartCount={cart.length}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          setStep("SHIPPING");
        }}
        title="Sign In Required to Complete Order"
        description="To safeguard your certified diamond acquisition with physical GIA/IGI inscriptions and armored Brink's courier handover, please sign in or register."
      />
    </Dialog>
  );
}
