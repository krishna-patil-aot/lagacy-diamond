import React from "react";
import { DiamondManagementIndex } from "./components/index";
import { IDiamondSearchParams } from "@/types/diamond.types";
import { Gem } from "lucide-react";

interface AdminDiamondsPageProps {
  searchParams: Promise<IDiamondSearchParams>;
}

export default async function AdminDiamondsPage({
  searchParams,
}: AdminDiamondsPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
        <Gem className="h-3.5 w-3.5 text-amber-700" />
        <span>Curator Portal</span>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Gemstone Inventory Lots</span>
      </div>

      <DiamondManagementIndex initialParams={resolvedSearchParams} />
    </div>
  );
}
