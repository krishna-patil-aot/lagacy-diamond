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
      {/* Step Indicator Header with clearance for the close button */}
      <div className="border-b border-stone-200 pb-3.5 mb-4 pr-8 sm:pr-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 shrink-0">
              <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-900">
              Shopping Cart & Checkout
            </span>
          </div>
          <span className="text-[11px] font-mono font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200 w-fit">
            {step === "CART" && "Step 1 of 3: Cart Review"}
            {step === "SHIPPING" && "Step 2 of 3: Delivery Address"}
            {step === "PAYMENT" && "Step 3 of 3: Payment & Offers"}
            {step === "AWAITING_APPROVAL" && "Verification"}
            {step === "SUCCESS" && "Order Confirmed"}
          </span>
        </div>
      </div>

      {/* STEP 1: CART ITEMS REVIEW */}
      {step === "CART" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-serif">
              Your Cart Selection ({cart.length})
            </h2>
            {cart.length > 0 && (
              <span className="text-xs text-stone-500 font-mono">
                {cart.length} {cart.length === 1 ? "diamond" : "diamonds"}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="py-10 sm:py-14 text-center space-y-3 px-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 border border-stone-200 text-stone-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-semibold text-stone-800">
                  Your shopping cart is empty
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Browse our certified lab-grown diamond collection to add your favourite gems.
                </p>
              </div>
              <Button variant="luxury" size="sm" onClick={onClose} className="mt-2">
                Browse Certified Diamonds
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
              {cart.map((diamond) => (
                <div
                  key={diamond._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3 sm:p-3.5 gap-3 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-lg overflow-hidden border border-stone-200 bg-white shrink-0">
                      <Image
                        src={diamond.images[0] || ""}
                        alt={diamond.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate">
                        {diamond.name}
                      </h4>
                      <div className="text-[11px] font-mono text-stone-600 mt-0.5">
                        {diamond.carat} ct • {diamond.shape} • {diamond.color} / {diamond.clarity}
                      </div>
                      <div className="text-[10px] font-mono text-amber-700 mt-0.5">
                        Cert: {diamond.lab} #{diamond.certificateNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/80">
                    <span className="text-sm sm:text-base font-bold font-mono text-stone-900">
                      {formatPrice(diamond.finalPrice)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeFromCart(diamond._id);
                        toast.info("Removed from Cart");
                      }}
                      className="h-8 w-8 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Remove diamond"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="border-t border-stone-200 pt-4 space-y-4">
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-900 gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Please sign in to proceed with secure delivery address and checkout.</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="shrink-0 h-7 text-xs font-semibold border-amber-300 text-amber-900 bg-white hover:bg-amber-100"
                  >
                    Sign In
                  </Button>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-600 font-medium">Cart Subtotal:</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-stone-900">
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
                    Proceed to Delivery Address
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
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              Insured Delivery Address
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep("CART")}
              className="text-xs text-stone-600 hover:text-stone-900 h-8 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back to Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">Full Legal Name *</label>
              <Input placeholder="e.g. Rahul Sharma" {...register("fullName")} error={errors.fullName?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">Tracking Email Address *</label>
              <Input type="email" placeholder="e.g. rahul.sharma@example.com" {...register("email")} error={errors.email?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">Contact Telephone *</label>
              <Input placeholder="e.g. +91 98765 43210" {...register("phone")} error={errors.phone?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">Country *</label>
              <Input placeholder="e.g. India" {...register("country")} error={errors.country?.message} />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-stone-700">Street & Apartment / Building Address *</label>
            <Input placeholder="e.g. 102, Bandra Kurla Complex, Bandra East" {...register("street")} error={errors.street?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">City *</label>
              <Input placeholder="e.g. Mumbai" {...register("city")} error={errors.city?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">State / Region *</label>
              <Input placeholder="e.g. Maharashtra" {...register("state")} error={errors.state?.message} />
            </div>
            <div>
              <label className="block mb-1 text-xs font-medium text-stone-700">PIN / Postal Code *</label>
              <Input placeholder="e.g. 400051" {...register("postalCode")} error={errors.postalCode?.message} />
            </div>
          </div>

          <div className="border-t border-stone-200 pt-4">
            <Button type="submit" variant="luxury" className="w-full justify-center text-sm h-11">
              Proceed to Payment & Summary
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: PAYMENT & DISCOUNT COUPON */}
      {step === "PAYMENT" && (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              Payment & Discount Offers
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep("SHIPPING")}
              className="text-xs text-stone-600 hover:text-stone-900 h-8 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
          </div>

          {/* Coupon Code Input & Chips */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 font-mono">
                <Tag className="h-3.5 w-3.5 text-amber-700" />
                <span>Apply Promo / Discount Code</span>
              </span>
              {appliedCoupon && (
                <Badge variant="gold" className="text-[10px]">
                  {appliedCoupon.discountPercentage}% OFF APPLIED
                </Badge>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter code (e.g. KRISHNAVIP)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="font-mono bg-white border-stone-300"
              />
              {appliedCoupon ? (
                <Button variant="outline" size="sm" onClick={removeCoupon} className="h-10 sm:h-9 shrink-0">
                  Remove
                </Button>
              ) : (
                <Button variant="luxury" size="sm" onClick={applyCoupon} className="h-10 sm:h-9 shrink-0 px-5">
                  Apply
                </Button>
              )}
            </div>

            {/* Quick Coupon Helper Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-stone-500 font-mono">Available Offers:</span>
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
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-stone-700 hover:border-amber-500 hover:text-amber-800 font-mono transition-colors shadow-xs"
                >
                  {coupon.code} (-{coupon.discountPercentage}%)
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-stone-700 block">
              Payment Method
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {[
                { id: "CREDIT_CARD", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                { id: "WIRE_TRANSFER", label: "Bank Transfer / UPI", sub: "NEFT, RTGS, IMPS & UPI" },
                { id: "VAULT_ESCROW", label: "Escrow Protection", sub: "Insured escrow handover" },
              ].map(({ id, label, sub }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id as "CREDIT_CARD" | "WIRE_TRANSFER" | "VAULT_ESCROW")}
                  className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                    paymentMethod === id
                      ? "border-stone-900 bg-stone-900 text-white shadow-xs"
                      : "border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  <div className="text-xs font-semibold">{label}</div>
                  <div className={`text-[10px] mt-0.5 ${paymentMethod === id ? "text-stone-300" : "text-stone-500"}`}>
                    {sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 sm:p-4 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Diamond Subtotal:</span>
              <span className="font-mono text-stone-900 font-medium">{formatPrice(subtotal)}</span>
            </div>
            {couponSavings > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Promotional Discount ({appliedCoupon?.code}):</span>
                <span className="font-mono">-{formatPrice(couponSavings)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Armored & Insured Transit:</span>
              <span className="font-mono text-emerald-700 font-semibold">FREE / COMPLIMENTARY</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2.5">
              <span>Final Payable Amount:</span>
              <span className="font-mono text-base sm:text-lg text-emerald-700">
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
            Confirm & Place Order
          </Button>
        </div>
      )}

      {/* STEP 4: AWAITING ADMIN APPROVAL */}
      {step === "AWAITING_APPROVAL" && activeOrder && (
        <div className="py-6 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 animate-pulse">
            <Clock className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto px-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="gold">ORDER #{activeOrder.id}</Badge>
              <span className="rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-mono font-medium">
                Under Verification
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              Order Received & In Verification
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your diamond acquisition order has been recorded. Our team is verifying the physical diamond certificate and preparing insured courier dispatch.
            </p>
          </div>

          {/* Detailed Order Status Card */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 max-w-md mx-auto text-left text-xs space-y-2.5">
            <div className="flex justify-between text-stone-600">
              <span>Order Reference:</span>
              <span className="font-mono text-stone-900 font-semibold">#{activeOrder.id}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Payable Total:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatPrice(activeOrder.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Recipient:</span>
              <span className="text-stone-900 truncate max-w-[200px]">
                {activeOrder.shippingAddress.fullName} ({activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state})
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-600 border-t border-stone-200 pt-2">
              <span>Status:</span>
              <span className="inline-flex items-center gap-1.5 text-amber-800 font-mono text-[11px] font-semibold">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping inline-block" />
                Awaiting Curator Confirmation
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 max-w-md mx-auto">
            <Link href="/orders" onClick={resetCheckout} className="w-full sm:w-auto">
              <Button
                variant="luxury"
                size="sm"
                className="w-full sm:w-auto px-6 text-xs h-10"
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
                  className="w-full sm:w-auto text-xs text-amber-800 hover:text-amber-900 border-amber-300 bg-amber-50 h-10"
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1" />
                  Approve in Admin Portal
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full sm:w-auto text-xs text-stone-600 hover:text-stone-900 h-10"
              onClick={resetCheckout}
            >
              Continue Browsing
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: ORDER PLACED SUCCESS */}
      {step === "SUCCESS" && (
        <div className="py-6 sm:py-8 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 animate-in zoom-in-50 duration-300">
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto px-2">
            <Badge variant="success">ORDER CONFIRMED & DISPATCHED</Badge>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Order Placed Successfully!
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Order <span className="font-mono text-stone-900 font-semibold">#{activeOrder?.id}</span> has been confirmed. Your gemstones are packaged in tamper-proof security seals with insurance.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex justify-between text-stone-600">
              <span>Settlement Total:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatPrice(activeOrder?.totalAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Destination:</span>
              <span className="text-stone-900 truncate max-w-[220px]">
                {activeOrder?.shippingAddress.street}, {activeOrder?.shippingAddress.city}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Certification:</span>
              <span className="text-emerald-700 font-mono font-medium">Lab Inscription Verified</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/orders" onClick={resetCheckout} className="w-full sm:w-auto">
              <Button variant="luxury" size="md" className="w-full sm:w-auto px-6">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Track Order
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={resetCheckout} className="w-full sm:w-auto px-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Continue Shopping
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
        description="To safeguard your certified diamond acquisition with physical lab inscriptions and insured courier handover, please sign in or register."
      />
    </Dialog>
  );
}
