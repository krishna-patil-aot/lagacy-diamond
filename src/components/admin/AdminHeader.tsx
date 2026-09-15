"use client";

import React, { useState } from "react";
import { Plus, Database, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface AdminHeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
  unreadMessagesCount?: number;
  onOpenInquiries?: () => void;
}

import { siteConfig } from "@/config/site.config";

export function AdminHeader({
  onAddNew,
  onRefresh,
  unreadMessagesCount = 0,
  onOpenInquiries,
}: AdminHeaderProps) {
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSeedMessage("Catalog seeded successfully!");
        toast.success("Vault Catalog Seeded Successfully!", {
          description: "Certified GIA diamonds loaded into database.",
        });
        onRefresh();
      }
    } catch {
      setSeedMessage("Failed to seed catalog.");
      toast.error("Failed to seed catalog.");
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs uppercase tracking-widest text-stone-600 font-mono font-medium">
            Atelier Vault &amp; Asset Management
          </span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-light tracking-tight text-stone-900">
          {siteConfig.brandName} Vault Portal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Curate solar-cultivated diamond lots, calibrate live atelier pricing, and oversee bespoke client orders.
        </p>
        {seedMessage && (
          <p className="mt-2 text-xs font-semibold text-emerald-700 animate-in fade-in">
            ✓ {seedMessage}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0">
        {unreadMessagesCount > 0 && onOpenInquiries && (
          <button
            type="button"
            onClick={onOpenInquiries}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold shadow-xs transition-all animate-pulse cursor-pointer"
            title="View incoming client consultation messages"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{unreadMessagesCount} New Client Message{unreadMessagesCount > 1 ? "s" : ""}</span>
          </button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          isLoading={isSeeding}
          className="flex-1 sm:flex-initial text-xs text-stone-700 hover:text-stone-900 border-stone-300 h-9 justify-center"
          title="Reset database with initial certified collection"
        >
          <Database className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
          <span>Seed / Reset</span>
        </Button>

        <Button
          variant="luxury"
          size="md"
          onClick={onAddNew}
          className="flex-1 sm:flex-initial text-xs sm:text-sm h-9 justify-center"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Add Diamond</span>
        </Button>
      </div>
    </div>
  );
}
