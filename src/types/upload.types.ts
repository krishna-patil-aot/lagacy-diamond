export interface IUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  error?: string;
}

export interface IUploadedImageMeta {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface IUploadProgressState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}
