"use client";

import React from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { DynamicForm } from "./dynamic-form";
import { IDynamicFieldConfig } from "@/types/admin.types";
import { Gem } from "lucide-react";

export interface DynamicFormModalProps<T extends FieldValues> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: IDynamicFieldConfig[];
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  calculatedSummary?: React.ReactNode;
}

export function DynamicFormModal<T extends FieldValues>({
  isOpen,
  onClose,
  title,
  description,
  fields,
  form,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  calculatedSummary,
}: DynamicFormModalProps<T>) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-900 text-stone-100">
            <Gem className="h-4 w-4 text-amber-200" />
          </div>
          <span className="font-serif text-lg sm:text-xl font-bold text-stone-900">{title}</span>
        </div>
      }
      description={description}
      className="max-w-3xl"
    >
      <DynamicForm
        fields={fields}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      >
        {calculatedSummary && <div className="pt-2">{calculatedSummary}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>

          <Button
            type="submit"
            variant="luxury"
            size="sm"
            isLoading={isSubmitting}
          >
            {submitLabel}
          </Button>
        </div>
      </DynamicForm>
    </Dialog>
  );
}
