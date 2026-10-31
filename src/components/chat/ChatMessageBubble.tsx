"use client";

import React, { useState } from "react";
import { IChatMessage } from "@/types/chat.types";
import { Check, CheckCheck, Copy } from "lucide-react";

interface ChatMessageBubbleProps {
  message: IChatMessage;
  isSelf: boolean;
  showSenderHeader?: boolean;
  isFirstInCluster?: boolean;
  isLastInCluster?: boolean;
}

export function ChatDateDivider({ dateLabel }: { dateLabel: string }) {
  return (
    <div className="flex items-center justify-center my-3 select-none">
      <span className="rounded-full bg-stone-200/80 text-stone-700 px-3 py-0.5 text-[10px] font-mono font-medium shadow-2xs backdrop-blur-xs border border-stone-300/40">
        {dateLabel}
      </span>
    </div>
  );
}

export function ChatMessageBubble({
  message,
  isSelf,
  showSenderHeader = false,
  isFirstInCluster = true,
  isLastInCluster = true,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const formatMessageTime = (isoString?: string): string => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const timeString = formatMessageTime(message.createdAt);

  const handleCopy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp-style corner rounding: notch tail only on the last message of a cluster
  const bubbleRounding = isSelf
    ? isFirstInCluster && isLastInCluster
      ? "rounded-2xl rounded-tr-xs"
      : isFirstInCluster
        ? "rounded-2xl rounded-tr-md rounded-br-md"
        : isLastInCluster
          ? "rounded-2xl rounded-tr-xs"
          : "rounded-2xl rounded-r-md"
    : isFirstInCluster && isLastInCluster
      ? "rounded-2xl rounded-tl-xs"
      : isFirstInCluster
        ? "rounded-2xl rounded-tl-md rounded-bl-md"
        : isLastInCluster
          ? "rounded-2xl rounded-tl-xs"
          : "rounded-2xl rounded-l-md";

  return (
    <div
      className={`group flex w-full items-end gap-1.5 ${
        isSelf ? "justify-end" : "justify-start"
      } ${isLastInCluster ? "mb-2" : "mb-0.5"}`}
    >
      {/* Copy button on hover for outgoing message */}
      {isSelf && (
        <button
          type="button"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 cursor-pointer shrink-0"
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </button>
      )}

      <div
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm shadow-xs transition-all ${bubbleRounding} ${
          isSelf
            ? "bg-[#005c4b] text-white"
            : "bg-white text-stone-900 border border-stone-200/90 shadow-2xs"
        }`}
      >
        {/* Optional Sender Header (Group chat only, hidden in 1-on-1 direct chat) */}
        {!isSelf && showSenderHeader && (
          <div className="text-[10px] font-semibold text-amber-800 pb-0.5 mb-0.5 border-b border-stone-100 truncate">
            {message.senderName}
          </div>
        )}

        {/* Message Content with inline-floated WhatsApp timestamp */}
        <div className="relative overflow-hidden">
          <span className="whitespace-pre-wrap break-words leading-relaxed select-text font-normal">
            {message.content}
          </span>

          {/* Inline WhatsApp Timestamp & Status Tick */}
          <span
            className={`inline-flex items-center gap-1 float-right translate-y-1 text-[10px] select-none ml-2.5 ${
              isSelf ? "text-emerald-100/90" : "text-stone-400"
            }`}
          >
            <span className="font-mono text-[9px] sm:text-[10px]">{timeString}</span>

            {isSelf && (
              <span className="inline-flex items-center ml-0.5" title={message.status}>
                {message.status === "READ" ? (
                  <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
                ) : message.status === "DELIVERED" ? (
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                ) : (
                  <Check className="w-3 h-3 text-emerald-200" />
                )}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Copy button on hover for incoming messages */}
      {!isSelf && (
        <button
          type="button"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200/60 cursor-pointer shrink-0"
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        </button>
      )}
    </div>
  );
}
