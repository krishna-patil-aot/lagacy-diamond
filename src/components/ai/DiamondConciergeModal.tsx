"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Bot, Send, RotateCcw, Gem, ExternalLink, Loader2 } from "lucide-react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useDiamondAssistant } from "@/hooks/useDiamondAssistant";

interface DiamondConciergeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DiamondConciergeModal: React.FC<DiamondConciergeModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    clearChat,
    quickPrompts,
  } = useDiamondAssistant();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-stone-950 border-stone-800 text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800/80 bg-stone-900/50 backdrop-blur-md flex items-center justify-between">
          <DialogHeader className="pr-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-serif text-white tracking-wide flex items-center gap-2">
                  Diamond Vault Concierge
                  <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10 py-0.5">
                    AI Matchmaker
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-400">
                  Real-time gemological matchmaking querying verified vault inventory
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 text-xs gap-1.5 hidden sm:inline-flex"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm scrollbar-thin scrollbar-thumb-stone-800">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-3 ${isUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      isUser
                        ? "bg-amber-600 text-white rounded-tr-xs"
                        : "bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-xs shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                      {msg.content}
                    </p>
                    <span className="block text-[10px] text-stone-400 mt-1 opacity-70">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Recommended Diamond Cards */}
                  {msg.recommendedDiamonds && msg.recommendedDiamonds.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {msg.recommendedDiamonds.map((stone) => (
                        <div
                          key={stone._id}
                          className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 hover:border-amber-500/50 transition-all text-left group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                              {stone.name}
                            </span>
                            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300 shrink-0">
                              {stone.lab}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-2">
                            <span>{stone.carat} ct</span>
                            <span>•</span>
                            <span>{stone.shape}</span>
                            <span>•</span>
                            <span>{stone.color} / {stone.clarity}</span>
                            <span>•</span>
                            <span>{stone.cut}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-stone-800/80">
                            <span className="text-xs font-semibold text-amber-400">
                              ${stone.finalPrice.toLocaleString()}
                            </span>
                            <Link
                              href={`/diamonds/${stone._id}`}
                              onClick={() => onOpenChange(false)}
                              className="inline-flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 px-2 py-1 rounded-md transition-colors"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0 animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-stone-400 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span>Consulting diamond vault inventory...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-stone-800/60 bg-stone-900/30 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          <span className="text-[11px] text-stone-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Gem className="h-3 w-3" /> Quick:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => void sendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-stone-800/80 hover:bg-amber-950/60 hover:text-amber-300 hover:border-amber-500/40 border border-stone-700/60 text-stone-300 rounded-lg px-2.5 py-1 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-stone-800 bg-stone-900/80 flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., 1.5ct Oval diamond under $6,000 with IGI/GIA certificate..."
            disabled={isLoading}
            className="flex-1 bg-stone-950 border-stone-800 text-stone-100 placeholder:text-stone-500 focus-visible:border-amber-500 focus-visible:ring-amber-500 h-10 text-xs sm:text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium px-4 rounded-xl shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send Inquiry</span>
          </Button>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};
