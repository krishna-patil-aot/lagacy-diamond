"use client";

import React, { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Checkbox } from "@/components/ui/Checkbox";
import { ArrowUpDown, Edit2, Trash2, Eye } from "lucide-react";

export function getIdColumn<T>(options: {
  accessorKey: keyof T;
  headerLabel?: string;
  className?: string;
}): ColumnDef<T> {
  const { accessorKey, headerLabel = "ID", className = "font-mono text-xs font-semibold text-stone-900" } = options;

  return {
    accessorKey: accessorKey as string,
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-3 h-8 text-xs font-semibold text-stone-700 hover:text-stone-900"
      >
        <span>{headerLabel}</span>
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-stone-400" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue(accessorKey as string);
      return <div className={className}>{String(val ?? "")}</div>;
    },
  };
}

export function getSelectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
          aria-label="Select all rows"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function LiveEnabledCell<T>({
  row,
  accessorKey,
  onToggle,
}: {
  row: Row<T>;
  accessorKey: keyof T;
  onToggle: (row: T, checked: boolean) => Promise<boolean>;
}) {
  const initialValue = Boolean(row.getValue(accessorKey as string));
  const [optimisticChecked, setOptimisticChecked] = useState<boolean | null>(null);
  const [prevInitialValue, setPrevInitialValue] = useState<boolean>(initialValue);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setOptimisticChecked(null);
  }

  const checked = optimisticChecked !== null ? optimisticChecked : initialValue;

  const handleChange = async (newChecked: boolean) => {
    setOptimisticChecked(newChecked);
    setIsUpdating(true);
    const success = await onToggle(row.original, newChecked);
    if (!success) {
      setOptimisticChecked(null);
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        disabled={isUpdating}
        onCheckedChange={handleChange}
        aria-label="Toggle status"
      />
      {isUpdating && <span className="text-[10px] font-mono text-stone-400 animate-pulse">Syncing...</span>}
    </div>
  );
}

export function getEnabledColumn<T>(options: {
  accessorKey: keyof T;
  headerLabel: string;
  onToggle: (row: T, checked: boolean) => Promise<boolean>;
}): ColumnDef<T> {
  const { accessorKey, headerLabel, onToggle } = options;

  return {
    accessorKey: accessorKey as string,
    header: () => <span className="text-xs font-semibold text-stone-700">{headerLabel}</span>,
    cell: ({ row }) => <LiveEnabledCell row={row} accessorKey={accessorKey} onToggle={onToggle} />,
  };
}

export function getActionColumn<T>(options: {
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  headerLabel?: string;
}): ColumnDef<T> {
  const { onEdit, onDelete, onView, headerLabel = "Actions" } = options;

  return {
    id: "actions",
    header: () => <span className="text-xs font-semibold text-stone-700">{headerLabel}</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1.5 justify-end">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(item)}
              className="h-8 w-8 p-0 text-stone-500 hover:text-stone-900"
              title="View details"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0 text-stone-600 hover:text-amber-700 hover:bg-amber-50"
              title="Edit record"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item)}
              className="h-8 w-8 p-0 text-stone-500 hover:text-rose-700 hover:bg-rose-50"
              title="Delete record"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
  };
}
