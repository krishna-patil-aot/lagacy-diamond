"use client";

import React from "react";
import { UseFormReturn, FieldValues, Path, PathValue, Controller } from "react-hook-form";
import { IDynamicFieldConfig } from "@/types/admin.types";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { FormSelect } from "@/components/ui/FormSelect";
import { Switch } from "@/components/ui/Switch";
import { ImageUploader } from "./image-uploader";

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
  const pathName = field.name as Path<T>;
  const images = (form.watch(pathName) as string[]) || [];

  const handleImagesChange = (updated: string[]) => {
    form.setValue(pathName, updated as PathValue<T, Path<T>>, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <ImageUploader
      images={images}
      onChange={handleImagesChange}
      disabled={field.disabled}
    />
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
