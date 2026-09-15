"use client";

import React from "react";
import { IDiamond } from "@/types/diamond.types";

import { siteConfig } from "@/config/site.config";

interface CertificateViewProps {
  diamond: IDiamond;
}

const GEMOLOGIST = "Dr. Alistair Sterling, FGA";
const GEMOLOGIST_TITLE = "Chief Gemological Appraiser & Vault Master";

export function CertificateView({ diamond }: CertificateViewProps) {
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const vaultId = `DARKGEM-${diamond.sku}`;
  const securityHash = Buffer.from(
    `${diamond.sku}-${diamond.certificateNumber}-${diamond.carat}`
  ).toString("hex");
  const verificationUrl = `${siteConfig.appUrl}/verify/${diamond.certificateNumber}`;

  return (
    <div
      className="select-none bg-[#fffdf9] text-[#1c1917] p-2 sm:p-6 rounded-sm w-full max-w-full mx-auto"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Outer gold border */}
      <div className="border-[2px] sm:border-[3px] border-[#b48c36] p-1 h-full">
        <div className="border border-[#785a1a] p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">

          {/* ── Lab Crest & Title ───────────────────────── */}
          <div className="text-center border-b border-[#dcd3c2] pb-2 sm:pb-3">
            <p className="text-[#855d14] uppercase tracking-[2px] sm:tracking-[4px] text-xs sm:text-sm font-bold">
              {diamond.lab} Accredited Gemological Laboratory
            </p>
            <p className="uppercase tracking-[1px] sm:tracking-[2px] text-[11px] sm:text-xs font-bold mt-0.5 sm:mt-1">
              Certificate of Authenticity · {siteConfig.brandName}
            </p>
            <p className="text-[#78716c] uppercase tracking-[1px] sm:tracking-[1.5px] text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 leading-tight"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              Official Gemological Dossier • Solar Plasma Cultivated Gemstone
            </p>
          </div>

          {/* ── Meta Bar ────────────────────────────────── */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 bg-[#f7f3eb] border border-[#e5dccb] rounded-sm px-2.5 sm:px-3 py-2 text-[9px] sm:text-[10px]"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
          >
            <span className="text-[#44403c]">
              Report Number: <strong className="text-[#1c1917]">{diamond.certificateNumber}</strong>
            </span>
            <span className="text-[#44403c]">
              Issue Date: <strong className="text-[#1c1917]">{issueDate}</strong>
            </span>
            <span className="text-[#44403c]">
              Vault Registry: <strong className="text-[#1c1917]">{vaultId}</strong>
            </span>
            <span className="text-[#44403c]">
              Status: <strong className="text-[#1c1917]">SEALED &amp; AUTHENTICATED</strong>
            </span>
          </div>

          {/* ── 4Cs Master Grading ──────────────────────── */}
          <div>
            <p className="text-[#855d14] uppercase tracking-[1.5px] sm:tracking-[2px] text-[9px] font-bold mb-1.5 sm:mb-2"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              The 4Cs Master Grading
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Carat Weight", value: `${diamond.carat.toFixed(2)} ct`, sub: "Exact Precision" },
                { label: "Color Grade",  value: diamond.color,                     sub: "Colorless" },
                { label: "Clarity Grade",value: diamond.clarity,                   sub: "Eye-Clean" },
                { label: "Cut Grade",    value: diamond.cut,                       sub: "Max Brilliance" },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="border border-[#b48c36] bg-white p-2 sm:p-3 text-center rounded-sm"
                >
                  <p className="text-[#78716c] uppercase text-[8px] tracking-[0.5px] sm:tracking-[1px] mb-0.5 sm:mb-1"
                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {label}
                  </p>
                  <p className="text-[#855d14] text-sm sm:text-base font-bold">{value}</p>
                  <p className="text-[#a8a29e] text-[7px] mt-0.5"
                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Proportions & Optical Analysis ─────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Left — Physical */}
            <div>
              <p className="text-[#855d14] uppercase tracking-[1.5px] sm:tracking-[2px] text-[9px] font-bold mb-1.5 sm:mb-2"
                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Physical Proportions
              </p>
              {[
                ["Shape & Cutting Profile", `${diamond.shape} Brilliant Cut`],
                [
                  "Measurements",
                  `${diamond.dimensions.length.toFixed(2)} × ${diamond.dimensions.width.toFixed(2)} × ${diamond.dimensions.depth.toFixed(2)} mm`,
                ],
                ["Table Percentage", `${diamond.tablePercentage}%`],
                ["Total Depth Percentage", `${diamond.depthPercentage}%`],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between py-1 border-b border-[#ebe5d8] text-[9px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  <span className="text-[#57534e]">{label}</span>
                  <span className="font-bold text-[#1c1917]">{val}</span>
                </div>
              ))}
            </div>

            {/* Right — Optical */}
            <div>
              <p className="text-[#855d14] uppercase tracking-[1.5px] sm:tracking-[2px] text-[9px] font-bold mb-1.5 sm:mb-2"
                 style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Optical Finish &amp; Grading
              </p>
              {[
                ["Polish",         diamond.polish],
                ["Symmetry",       diamond.symmetry],
                ["Fluorescence",   diamond.fluorescence],
                ["Growth Process", "CVD / HPHT Eco-Foundry"],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="flex justify-between py-1 border-b border-[#ebe5d8] text-[9px]"
                  style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  <span className="text-[#57534e]">{label}</span>
                  <span className="font-bold text-[#1c1917]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Security Seal & Signature ───────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#faf7f0] border border-[#e5dccb] rounded-sm p-3 sm:px-4 sm:py-3 gap-3 sm:gap-4">
            {/* Seal & Verification */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="border-[1.5px] border-dashed border-[#b48c36] rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[#855d14] text-[6px] sm:text-[7px] font-bold uppercase tracking-wide text-center leading-tight"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  OFFICIAL<br />VAULT SEAL<br />★ GENUINE ★
                </span>
              </div>

              <div className="flex-1 min-w-0" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                <p className="text-[#855d14] font-bold uppercase text-[8px] tracking-wide">
                  Cryptographic Vault Pass
                </p>
                <p className="text-[#78716c] text-[8px] mt-0.5 leading-snug break-all sm:break-normal">
                  Verify: {verificationUrl}
                </p>
                <p className="text-[#a8a29e] text-[7px] mt-0.5 font-mono truncate">
                  Hash: {securityHash.slice(0, 20)}...
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="text-center w-full sm:w-36 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200 sm:flex-shrink-0" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <p className="text-[#1c1917] text-xs italic mb-1">{GEMOLOGIST}</p>
              <div className="border-b border-[#1c1917] mb-1" />
              <p className="text-[8px] font-bold uppercase text-[#1c1917]">{GEMOLOGIST}</p>
              <p className="text-[7px] text-[#78716c]">{GEMOLOGIST_TITLE}</p>
            </div>
          </div>

          {/* ── Legal Footer ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-[#dcd3c2] pt-2 gap-1"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            <p className="text-[7px] text-[#a8a29e] leading-snug">
              This document constitutes an official gemological grading report under ISO standard
              laboratory testing. Guaranteed conflict-free.
            </p>
            <p className="text-[7px] text-[#78716c] font-mono flex-shrink-0">SEC-ID: {diamond.sku}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
