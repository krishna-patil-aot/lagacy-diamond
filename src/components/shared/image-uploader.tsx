"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";

export interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const { isUploading, uploadProgress, uploadFiles } = useCloudinaryUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedUrls = await uploadFiles(files);
    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      const uploadedUrls = await uploadFiles(files);
      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    },
    [disabled, isUploading, uploadFiles, onChange, images]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    onChange([...images, trimmed]);
    setManualUrl("");
  };

  const handleRemove = (index: number) => {
    const filtered = images.filter((_, idx) => idx !== index);
    onChange(filtered);
  };

  return (
    <div className="space-y-3.5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        id="diamond-image-upload"
      />

      {/* Cloudinary Drag & Drop Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? "border-amber-500 bg-amber-50/70 scale-[1.01]"
            : "border-stone-300/80 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400"
        } ${disabled || isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-stone-200 text-stone-700 shadow-xs mb-3 group-hover:scale-110 transition-transform">
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6 text-amber-600" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone-900">
            {isUploading
              ? `Uploading to Cloudinary CDN (${uploadProgress}%)...`
              : "Drop gemstone images here, or tap to browse"}
          </p>
          <p className="text-[11px] text-stone-500">
            JPG, PNG, WebP or AVIF up to 10MB each. High-res laboratory specimens supported.
          </p>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full max-w-xs mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full bg-amber-600 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual URL Fallback Toggle Bar */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] text-amber-800 hover:text-amber-900 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>{showManualInput ? "Hide direct URL input" : "Or paste direct image URL"}</span>
        </button>

        <span className="text-[11px] font-mono text-stone-500">
          {images.length} {images.length === 1 ? "specimen" : "specimens"} attached
        </span>
      </div>

      {/* Manual Direct URL Input Field */}
      {showManualInput && (
        <div className="flex gap-2 animate-in fade-in duration-200">
          <Input
            placeholder="https://res.cloudinary.com/... or external image URL"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddManualUrl();
              }
            }}
            disabled={disabled || isUploading}
            className="text-xs h-9 bg-white"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleAddManualUrl}
            disabled={!manualUrl.trim() || disabled || isUploading}
            className="shrink-0 h-9 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Add URL</span>
          </Button>
        </div>
      )}

      {/* Gallery of Uploaded Diamond Images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs transition-shadow hover:shadow-md"
            >
              <Image
                src={url}
                alt={`Gemstone specimen ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                unoptimized
              />

              {/* Primary Photo Badge */}
              {idx === 0 && (
                <div className="absolute left-1.5 top-1.5 rounded-full bg-stone-900/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  <span>Cover</span>
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                disabled={disabled || isUploading}
                className="absolute right-1.5 top-1.5 rounded-xl bg-stone-900/80 p-1.5 text-white hover:bg-rose-600 transition-colors opacity-90 group-hover:opacity-100 shadow-sm cursor-pointer"
                aria-label="Remove image"
                title="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-stone-200 p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
          <ImageIcon className="h-4 w-4 text-stone-300" />
          <span>No gemstone specimen images attached yet</span>
        </div>
      )}
    </div>
  );
}
