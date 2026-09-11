"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useDiamondDetails } from "@/hooks/useDiamondDetails";
import { DiamondDetailView } from "@/components/store/DiamondDetailView";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AlertCircle, ChevronLeft } from "lucide-react";

export default function DiamondDetailPage({
  params,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const routeParams = useParams();
  const routeId =
    typeof routeParams?.id === "string"
      ? routeParams.id
      : Array.isArray(routeParams?.id)
      ? routeParams.id[0]
      : "";

  const propId =
    params && "id" in params && typeof params.id === "string"
      ? params.id
      : "";

  const id = routeId || propId;
  const { diamond, isLoading, error, refetch } = useDiamondDetails(id);

  if (isLoading && !diamond) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 aspect-[4/3] rounded-2xl border border-stone-200 bg-stone-100 animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-48 rounded-lg bg-stone-200 animate-pulse" />
            <div className="h-12 w-full rounded-lg bg-stone-200 animate-pulse" />
            <div className="h-28 w-full rounded-xl bg-stone-200 animate-pulse" />
            <div className="h-40 w-full rounded-xl bg-stone-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if ((error || !diamond) && !isLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-serif font-light text-stone-900">
          Diamond Lot Not Found
        </h2>
        <p className="text-xs text-stone-500">
          {error ||
            "The requested diamond has either been transferred or is no longer listed."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry Inspection
          </Button>
          <Link href="/diamonds">
            <Button variant="luxury" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Return to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!diamond) return null;

  return <DiamondDetailView diamond={diamond} />;
}
