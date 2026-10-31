"use client";

import React from "react";

interface ChatQuickRepliesProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  { label: "💎 Diamond Inquiry", prompt: "Hello, I am interested in inquiring about your certified lab-grown diamonds." },
  { label: "💍 Custom Ring", prompt: "Can I commission a bespoke engagement ring setting with a custom diamond?" },
  { label: "📦 Order Status", prompt: "I would like an update on the status of my vault order and delivery timeline." },
  { label: "📜 GIA Dossier", prompt: "How do I verify the GIA or IGI digital certificate for my diamond?" },
];

export function ChatQuickReplies({ onSelect, disabled = false }: ChatQuickRepliesProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-1.5 sm:py-2 px-1">
      {QUICK_PROMPTS.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onSelect(item.prompt)}
          disabled={disabled}
          className="whitespace-nowrap rounded-full bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 hover:text-stone-900 border border-stone-200/80 px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

