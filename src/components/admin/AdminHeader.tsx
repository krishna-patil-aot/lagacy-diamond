"use client";

import React, { useState } from "react";
import { Plus, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface AdminHeaderProps {
  onAddNew: () => void;
  onRefresh: () => void;
}

export function AdminHeader({ onAddNew, onRefresh }: AdminHeaderProps) {
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
            Foundry Asset & Vault Management
          </span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-light tracking-tight text-stone-900">
          Legacy Diamond Foundry Vault Portal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-500">
          Curate lab-grown diamond lots, calibrate live D2C foundry pricing, and approve bespoke client orders.
        </p>
        {seedMessage && (
          <p className="mt-2 text-xs font-semibold text-emerald-700 animate-in fade-in">
            ✓ {seedMessage}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          isLoading={isSeeding}
          className="text-xs text-stone-700 hover:text-stone-900 border-stone-300"
          title="Reset database with initial certified collection"
        >
          <Database className="h-3.5 w-3.5 mr-1.5 text-stone-500" />
          Seed / Reset Vault
        </Button>

        <Button
          variant="luxury"
          size="md"
          onClick={onAddNew}
          className="text-xs sm:text-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Diamond
        </Button>
      </div>
    </div>
  );
}
