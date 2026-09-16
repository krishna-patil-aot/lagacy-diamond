"use client";

import React, { useState } from "react";
import Image from "next/image";
import { UseFormReturn, FieldValues, Path, PathValue, Controller } from "react-hook-form";
import { IDynamicFieldConfig } from "@/types/admin.types";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FormSelect } from "@/components/ui/FormSelect";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

export interface DynamicFormProps<T extends FieldValues> {
  fields: IDynamicFieldConfig[];
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  isSubmitting?: boolean;
  children?: React.ReactNode;
}

function ImageListField<T extends FieldValues>({
  field,
  form,
}: {
  field: IDynamicFieldConfig;
  form: UseFormReturn<T>;
}) {
  const [newUrl, setNewUrl] = useState<string>("");
  const pathName = field.name as Path<T>;
  const images = (form.watch(pathName) as string[]) || [];

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    const updated = [...images, newUrl.trim()];
    form.setValue(pathName, updated as PathValue<T, Path<T>>, { shouldValidate: true });
    setNewUrl("");
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    form.setValue(pathName, updated as PathValue<T, Path<T>>, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Paste high-res gemstone image URL (https://...)"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="text-xs h-9 bg-white"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleAdd}
          className="shrink-0 h-9 text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span>Add URL</span>
        </Button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100"
            >
              <Image
                src={url}
                alt={`Image preview ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 25vw"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute right-1 top-1 rounded-lg bg-stone-900/80 p-1 text-white hover:bg-rose-600 transition-colors opacity-80 group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <ImageIcon className="h-4 w-4 text-stone-300" />
          <span>No image URLs attached yet</span>
        </div>
      )}
    </div>
  );
}

export function DynamicForm<T extends FieldValues>({
  fields,
  form,
  onSubmit,
  isSubmitting = false,
  children,
}: DynamicFormProps<T>) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const pathName = field.name as Path<T>;
          const errorMsg = errors[pathName]?.message as string | undefined;
          const colClass = field.colSpan === 2 ? "sm:col-span-2" : "sm:col-span-1";

          return (
            <div key={field.name} className={`space-y-1.5 ${colClass}`}>
              {field.type !== "switch" && (
                <Label htmlFor={field.name} className="text-xs font-medium text-stone-700">
                  {field.label}
                  {field.required && <span className="text-amber-600 ml-0.5">*</span>}
                </Label>
              )}

              {/* Text, Email, Number Inputs */}
              {(field.type === "text" || field.type === "email" || field.type === "number") && (
                <Input
                  id={field.name}
                  type={field.type}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  placeholder={field.placeholder}
                  disabled={field.disabled || isSubmitting}
                  className="text-xs h-9 bg-white"
                  {...register(pathName, {
                    valueAsNumber: field.type === "number",
                  })}
                />
              )}

              {/* Textarea */}
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  disabled={field.disabled || isSubmitting}
                  rows={3}
                  className="text-xs bg-white"
                  {...register(pathName)}
                />
              )}

              {/* Select Dropdown */}
              {field.type === "select" && field.options && (
                <Controller
                  name={pathName}
                  control={control}
                  render={({ field: controllerField }) => (
                    <FormSelect
                      value={String(controllerField.value ?? "")}
                      onChange={(val: string) => controllerField.onChange(val)}
                      options={field.options || []}
                      disabled={field.disabled || isSubmitting}
                      className="text-xs h-9 bg-white"
                    />
                  )}
                />
              )}

              {/* Switch Toggle */}
              {field.type === "switch" && (
                <Controller
                  name={pathName}
                  control={control}
                  render={({ field: controllerField }) => (
                    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-3">
                      <div>
                        <Label
                          htmlFor={field.name}
                          className="text-xs font-semibold text-stone-900 cursor-pointer"
                        >
                          {field.label}
                        </Label>
                        {field.description && (
                          <p className="text-[11px] text-stone-500 mt-0.5">{field.description}</p>
                        )}
                      </div>
                      <Switch
                        id={field.name}
                        checked={Boolean(controllerField.value)}
                        onCheckedChange={controllerField.onChange}
                        disabled={field.disabled || isSubmitting}
                      />
                    </div>
                  )}
                />
              )}

              {/* Image List */}
              {field.type === "image-list" && (
                <ImageListField field={field} form={form} />
              )}

              {/* Field Description */}
              {field.description && field.type !== "switch" && (
                <p className="text-[10px] text-stone-400">{field.description}</p>
              )}

              {/* Error Message */}
              {errorMsg && <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>}
            </div>
          );
        })}
      </div>

      {children}
    </form>
  );
}
