"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { IUploadResponse } from "@/types/upload.types";

export interface IUseCloudinaryUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadFiles: (files: FileList | File[]) => Promise<string[]>;
  uploadSingleFile: (file: File) => Promise<string | null>;
}

export function useCloudinaryUpload(): IUseCloudinaryUploadReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const uploadSingleFile = useCallback(
    async (file: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      const json = (await res.json()) as IUploadResponse;

      if (!res.ok || !json.success || !json.url) {
        throw new Error(json.error || `Failed to upload ${file.name}`);
      }

      return json.url;
    },
    [token]
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[]): Promise<string[]> => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return [];

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const toastId = "cloudinary-upload";
      toast.loading(
        `Uploading ${fileArray.length} gemstone ${fileArray.length === 1 ? "specimen" : "specimens"} to Cloudinary...`,
        { id: toastId }
      );

      const uploadedUrls: string[] = [];
      let completedCount = 0;

      try {
        for (const file of fileArray) {
          // Client-side quick size validation
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`${file.name} exceeds 10MB limit`);
          }

          const url = await uploadSingleFile(file);
          if (url) {
            uploadedUrls.push(url);
          }

          completedCount++;
          setUploadProgress(Math.round((completedCount / fileArray.length) * 100));
        }

        toast.success(
          `Successfully uploaded ${uploadedUrls.length} ${uploadedUrls.length === 1 ? "image" : "images"} to Cloudinary CDN`,
          { id: toastId }
        );
        return uploadedUrls;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Media upload failed";
        setError(message);
        toast.error("Upload failed", {
          id: toastId,
          description: message,
        });
        return uploadedUrls;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [uploadSingleFile]
  );

  return {
    isUploading,
    uploadProgress,
    error,
    uploadFiles,
    uploadSingleFile,
  };
}
