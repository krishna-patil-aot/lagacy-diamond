"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface INotFoundDestination {
  title: string;
  description: string;
  href: string;
  badge?: string;
  iconName: "diamonds" | "direct" | "home" | "admin";
}

export interface IUseNotFoundNavigationReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleGoBack: () => void;
  destinations: INotFoundDestination[];
}

export function useNotFoundNavigation(): IUseNotFoundNavigationReturn {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (trimmed) {
        router.push(`/diamonds?search=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/diamonds");
      }
    },
    [searchQuery, router]
  );

  const handleGoBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  const destinations: INotFoundDestination[] = [
    {
      title: "Cultivated Diamond Vault",
      description: "Browse certified round, oval, emerald, and radiant lab-grown diamonds.",
      href: "/diamonds",
      badge: "Certified IGI & GIA",
      iconName: "diamonds",
    },
    {
      title: "Direct Foundry Offerings",
      description: "Exclusive direct-to-consumer stones with up to 30% foundry privilege.",
      href: "/diamonds?discount=true",
      badge: "Direct Pricing",
      iconName: "direct",
    },
    {
      title: "Foundry Homepage",
      description: "Discover our plasma CVD synthesis and ethical origin transparency.",
      href: "/",
      iconName: "home",
    },
  ];

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleGoBack,
    destinations,
  };
}
