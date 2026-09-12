"use client";

import { useState, useCallback } from "react";
import { IDiamond } from "@/types/diamond.types";

export interface CertificateViewerState {
  open: boolean;
  diamond: IDiamond | null;
}

const INITIAL_STATE: CertificateViewerState = {
  open: false,
  diamond: null,
};

export function useCertificateViewer() {
  const [viewerState, setViewerState] = useState<CertificateViewerState>(INITIAL_STATE);

  const openCertificate = useCallback((diamond: IDiamond) => {
    setViewerState({ open: true, diamond });
  }, []);

  const closeCertificate = useCallback(() => {
    setViewerState(INITIAL_STATE);
  }, []);

  return {
    viewerState,
    openCertificate,
    closeCertificate,
  };
}
