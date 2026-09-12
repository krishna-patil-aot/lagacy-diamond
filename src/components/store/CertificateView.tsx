"use client";

import React from "react";
import { IDiamond } from "@/types/diamond.types";

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

  const vaultId = `VAULT-${diamond.sku}`;
  const securityHash = Buffer.from(
    `${diamond.sku}-${diamond.certificateNumber}-${diamond.carat}`
  ).toString("hex");
  const verificationUrl = `https://legacydiamond.luxury/verify/${diamond.certificateNumber}`;

  return (
    <div
      className="select-none bg-[#fffdf9] text-[#1c1917] p-6 rounded-sm"
      style={{ fontFamily: "'Times New Roman', Times, serif" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Outer gold border */}
      <div className="border-[3px] border-[#b48c36] p-1 h-full">
        <div className="border border-[#785a1a] p-5 flex flex-col gap-4">

          {/* ── Lab Crest & Title ───────────────────────── */}
          <div className="text-center border-b border-[#dcd3c2] pb-3">
            <p className="text-[#855d14] uppercase tracking-[4px] text-sm font-bold">
              {diamond.lab} Accredited Gemological Laboratory
            </p>
            <p className="uppercase tracking-[2px] text-xs font-bold mt-1">
              Certificate of Authenticity
            </p>
            <p className="text-[#78716c] uppercase tracking-[1.5px] text-[10px] mt-1"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              Official Gemological Grading Dossier • Foundry Cultivated Gemstone
            </p>
          </div>

          {/* ── Meta Bar ────────────────────────────────── */}
          <div
            className="flex flex-wrap justify-between items-center bg-[#f7f3eb] border border-[#e5dccb] rounded-sm px-3 py-2 gap-2 text-[10px]"
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
            <p className="text-[#855d14] uppercase tracking-[2px] text-[9px] font-bold mb-2"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              The 4Cs Master Grading
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Carat Weight", value: `${diamond.carat.toFixed(2)} ct`, sub: "Exact Precision" },
                { label: "Color Grade",  value: diamond.color,                     sub: "Colorless" },
                { label: "Clarity Grade",value: diamond.clarity,                   sub: "Eye-Clean" },
                { label: "Cut Grade",    value: diamond.cut,                       sub: "Max Brilliance" },
              ].map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="border border-[#b48c36] bg-white p-3 text-center rounded-sm"
                >
                  <p className="text-[#78716c] uppercase text-[8px] tracking-[1px] mb-1"
                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {label}
                  </p>
                  <p className="text-[#855d14] text-base font-bold">{value}</p>
                  <p className="text-[#a8a29e] text-[7px] mt-0.5"
                     style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Proportions & Optical Analysis ─────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left — Physical */}
            <div>
              <p className="text-[#855d14] uppercase tracking-[2px] text-[9px] font-bold mb-2"
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
              <p className="text-[#855d14] uppercase tracking-[2px] text-[9px] font-bold mb-2"
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
          <div className="flex items-center justify-between bg-[#faf7f0] border border-[#e5dccb] rounded-sm px-4 py-3 gap-4">
            {/* Seal */}
            <div className="border-[1.5px] border-dashed border-[#b48c36] rounded-full w-20 h-20 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-[#855d14] text-[7px] font-bold uppercase tracking-wide text-center leading-tight"
                    style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                OFFICIAL<br />VAULT SEAL<br />★ GENUINE ★
              </span>
            </div>

            {/* Verification */}
            <div className="flex-1" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <p className="text-[#855d14] font-bold uppercase text-[8px] tracking-wide">
                Cryptographic Vault Pass
              </p>
              <p className="text-[#78716c] text-[8px] mt-1 leading-snug">
                Verify online at: {verificationUrl}
              </p>
              <p className="text-[#a8a29e] text-[7px] mt-1 font-mono">
                Hash: {securityHash.slice(0, 24)}...
              </p>
            </div>

            {/* Signature */}
            <div className="text-center w-36 flex-shrink-0" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <p className="text-[#1c1917] text-xs italic mb-1">{GEMOLOGIST}</p>
              <div className="border-b border-[#1c1917] mb-1" />
              <p className="text-[8px] font-bold uppercase text-[#1c1917]">{GEMOLOGIST}</p>
              <p className="text-[7px] text-[#78716c]">{GEMOLOGIST_TITLE}</p>
            </div>
          </div>

          {/* ── Legal Footer ───────────────────────────── */}
          <div className="flex justify-between items-start border-t border-[#dcd3c2] pt-2"
               style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            <p className="text-[7px] text-[#a8a29e] max-w-[80%] leading-snug">
              This document constitutes an official gemological grading report under ISO standard
              laboratory testing. The gemstone described has been examined by senior gemologists
              utilizing optical spectroscopy and micro-laser inspection. Guaranteed conflict-free.
            </p>
            <p className="text-[7px] text-[#78716c] font-mono">SEC-ID: {diamond.sku}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
