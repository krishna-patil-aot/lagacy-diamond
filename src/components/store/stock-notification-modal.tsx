"use client";

import React, { useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { IDiamond } from "@/types/diamond.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Bell, X, CheckCircle2, Loader2, Sparkles, Mail } from "lucide-react";

interface StockNotificationModalProps {
  isOpen: boolean;
  diamond: IDiamond | null;
  defaultEmail: string;
  defaultName: string;
  isSubmitting: boolean;
  isSubscribed: boolean;
  onClose: () => void;
  onSubmit: (email: string, clientName?: string) => Promise<boolean>;
}

export function StockNotificationModal({
  isOpen,
  diamond,
  defaultEmail,
  defaultName,
  isSubmitting,
  isSubscribed,
  onClose,
  onSubmit,
}: StockNotificationModalProps) {
  if (!isOpen || !diamond) return null;

  return (
    <StockNotificationModalContent
      diamond={diamond}
      defaultEmail={defaultEmail}
      defaultName={defaultName}
      isSubmitting={isSubmitting}
      isSubscribed={isSubscribed}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function StockNotificationModalContent({
  diamond,
  defaultEmail,
  defaultName,
  isSubmitting,
  isSubscribed,
  onClose,
  onSubmit,
}: Omit<StockNotificationModalProps, "isOpen"> & { diamond: IDiamond }) {
  const [email, setEmail] = useState<string>(defaultEmail);
  const name = defaultName;

  const thumbnail =
    diamond.images && diamond.images.length > 0
      ? diamond.images[0]
      : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, name);
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm animate-in fade-in-0 duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-stone-800 bg-stone-950 p-5 sm:p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 focus:outline-hidden text-stone-100">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <Dialog.Title className="font-serif text-base sm:text-lg font-medium text-stone-100">
                  Stock Availability Alert
                </Dialog.Title>
                <p className="text-[11px] text-stone-400">
                  Receive an automated email the moment this lot is restocked
                </p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Specimen Preview Card */}
          <div className="my-4 flex items-center gap-3.5 rounded-2xl border border-stone-800/90 bg-stone-900/60 p-3">
            <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
              <Image
                src={thumbnail}
                alt={diamond.name}
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="gold" className="text-[10px] font-mono">
                  {diamond.sku}
                </Badge>
                <span className="text-[11px] text-rose-400 font-medium">
                  Currently Out of Stock
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-serif text-stone-200 truncate mt-0.5">
                {diamond.name}
              </h4>
              <p className="text-[11px] font-mono text-stone-400">
                {diamond.shape} • {diamond.carat} ct • Color {diamond.color}
              </p>
            </div>
          </div>

          {/* Success State */}
          {isSubscribed ? (
            <div className="space-y-4 py-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-serif text-stone-100">
                  Notification Confirmed
                </h3>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  You are confirmed to receive an alert at{" "}
                  <span className="font-mono text-amber-300 font-medium">
                    {email}
                  </span>{" "}
                  as soon as this lot is restocked in the vault.
                </p>
              </div>
              <Button
                variant="outline"
                size="md"
                className="w-full justify-center border-stone-700 text-stone-300 hover:bg-stone-800"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          ) : (
            /* Subscription Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-3 text-xs text-amber-200/90 leading-relaxed">
                Do you want to get notified automatically via email when this
                product becomes available in our vault?
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-300 mb-1">
                  Email Address for Alert
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  icon={<Mail className="h-4 w-4 text-stone-400" />}
                  className="bg-stone-900 border-stone-800 text-stone-100 placeholder:text-stone-600 focus:border-amber-400 h-10"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 justify-center border-stone-800 text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="luxury"
                  size="md"
                  disabled={isSubmitting || !email}
                  className="flex-1 justify-center bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Establishing...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-1.5" />
                      Notify Me
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] text-stone-500 pt-1">
                <Sparkles className="h-3 w-3 text-amber-500/80" /> One-time
                notification • No spam guaranteed
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
