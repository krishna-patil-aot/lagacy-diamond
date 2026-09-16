"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/Switch";

export interface EnabledSwitchProps {
  checked: boolean;
  onToggle: (checked: boolean) => Promise<boolean>;
  disabled?: boolean;
  label?: string;
}

export function EnabledSwitch({
  checked: initialChecked,
  onToggle,
  disabled = false,
  label,
}: EnabledSwitchProps) {
  const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(null);
  const [prevInitialChecked, setPrevInitialChecked] = useState<boolean>(initialChecked);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (initialChecked !== prevInitialChecked) {
    setPrevInitialChecked(initialChecked);
    setOptimisticChecked(null);
  }

  const checked = optimisticChecked !== null ? optimisticChecked : initialChecked;

  const handleChange = async (newChecked: boolean) => {
    setOptimisticChecked(newChecked);
    setIsUpdating(true);
    const success = await onToggle(newChecked);
    if (!success) {
      setOptimisticChecked(null);
    }
    setIsUpdating(false);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Switch
        checked={checked}
        disabled={disabled || isUpdating}
        onCheckedChange={handleChange}
        aria-label={label || "Toggle state"}
      />
      {label && <span className="text-xs text-stone-700">{label}</span>}
      {isUpdating && <span className="text-[10px] font-mono text-stone-400 animate-pulse">Syncing...</span>}
    </div>
  );
}
