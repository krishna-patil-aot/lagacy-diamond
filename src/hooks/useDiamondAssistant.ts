"use client";

import { useState, useCallback } from "react";
import { IAIMessage, IAIChatResponse } from "@/types/ai.types";
import { siteConfig } from "@/config/site.config";

const INITIAL_GREETING: IAIMessage = {
  id: "initial-greeting",
  role: "assistant",
  content: siteConfig.assistant.greeting,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export const QUICK_PROMPT_SUGGESTIONS: string[] = [
  "2.0 ct Oval solitaire in F / VVS2",
  "Round brilliant with GIA / IGI Ideal cut",
  "D-Color VVS1 bespoke solitaire diamond",
  "How does solar plasma crystallization work?",
  "Type IIa diamond certification vs mined",
];

export function useDiamondAssistant() {
  const [messages, setMessages] = useState<IAIMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const sendMessage = useCallback(
    async (customPrompt?: string) => {
      const textToSend = (customPrompt || input).trim();
      if (!textToSend || isLoading) return;

      const userMsg: IAIMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai/concierge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: textToSend },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Concierge service responded with status ${response.status}`);
        }

        const data = (await response.json()) as IAIChatResponse;

        const botMsg: IAIMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          recommendedDiamonds: data.matchedDiamonds,
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to contact concierge";
        const failureMsg: IAIMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `I apologize, but our vault archives could not be reached momentarily (${errorMsg}). Please try your search again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, failureMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages]
  );

  const clearChat = useCallback(() => {
    setMessages([INITIAL_GREETING]);
    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    clearChat,
    quickPrompts: QUICK_PROMPT_SUGGESTIONS,
  };
}
