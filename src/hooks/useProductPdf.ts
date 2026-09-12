"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useProductPdf() {
  const [isDownloadingSpec, setIsDownloadingSpec] = useState<boolean>(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState<boolean>(false);

  const downloadSpecPdf = useCallback(async (diamondId: string, sku: string) => {
    try {
      setIsDownloadingSpec(true);
      toast.loading("Compiling high-resolution diamond dossier...", { id: "spec-pdf" });

      const res = await fetch(`/api/pdf/spec/${diamondId}`);
      if (!res.ok) throw new Error("Failed to generate technical dossier");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Diamond_Spec_Dossier_${sku}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Dossier PDF downloaded successfully", { id: "spec-pdf" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error generating PDF";
      toast.error(msg, { id: "spec-pdf" });
    } finally {
      setIsDownloadingSpec(false);
    }
  }, []);

  const downloadCertificatePdf = useCallback(
    async (diamondId: string, certNumber: string, lab: string) => {
      try {
        setIsDownloadingCert(true);
        toast.loading(`Retrieving official ${lab} Authorized Certificate...`, {
          id: "cert-pdf",
        });

        const res = await fetch(`/api/pdf/certificate/${diamondId}`);
        if (!res.ok) throw new Error("Failed to generate lab certificate");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Lab_Authorized_Certificate_${lab}_${certNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Official Lab Certificate downloaded", { id: "cert-pdf" });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error generating certificate";
        toast.error(msg, { id: "cert-pdf" });
      } finally {
        setIsDownloadingCert(false);
      }
    },
    []
  );

  return {
    downloadSpecPdf,
    downloadCertificatePdf,
    isDownloadingSpec,
    isDownloadingCert,
  };
}
