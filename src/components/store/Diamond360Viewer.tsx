"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { RotateCw, Play, Pause, Sparkles, Compass } from "lucide-react";
import { IDiamond } from "@/types/diamond.types";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { toast } from "sonner";

interface Diamond360ViewerProps {
  diamond: IDiamond;
  className?: string;
}

export function Diamond360Viewer({ diamond, className = "" }: Diamond360ViewerProps) {
  const [rotation, setRotation] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);

  const images =
    diamond.images && diamond.images.length > 0
      ? diamond.images
      : ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80"];

  const currentImageIndex = Math.floor((rotation % 360) / (360 / Math.max(1, images.length))) % images.length;
  const currentImg = images[currentImageIndex] || images[0];

  useEffect(() => {
    if (!isAutoSpinning || isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 45);
    return () => clearInterval(interval);
  }, [isAutoSpinning, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotationRef.current = rotation;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setIsDragging(true);
      startXRef.current = e.touches[0].clientX;
      startRotationRef.current = rotation;
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - startXRef.current;
      const newRotation = (startRotationRef.current + Math.round(delta * 0.8)) % 360;
      setRotation(newRotation < 0 ? newRotation + 360 : newRotation);
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const delta = e.touches[0].clientX - startXRef.current;
      const newRotation = (startRotationRef.current + Math.round(delta * 0.8)) % 360;
      setRotation(newRotation < 0 ? newRotation + 360 : newRotation);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  const toggleAutoSpin = () => {
    setIsAutoSpinning(!isAutoSpinning);
    toast.info(!isAutoSpinning ? "360° Auto-spin resumed" : "360° Auto-spin paused");
  };

  const lightPosition = `${(rotation / 360) * 100}%`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-white select-none shadow-xs ${className}`}
    >
      {/* 360 Badge & Coordinates */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <Badge variant="cyan" className="gap-1.5 py-0.5 px-2.5">
          <RotateCw className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
          <span>360° Inspection</span>
        </Badge>
        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-mono text-stone-600 border border-stone-200 shadow-xs">
          {rotation}°
        </span>
      </div>

      {/* Interactive Drag Surface */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative aspect-[4/3] w-full cursor-grab active:cursor-grabbing bg-stone-100"
        title="Drag left/right to rotate diamond 360 degrees"
      >
        <Image
          src={currentImg}
          alt={`360 view of ${diamond.name}`}
          fill
          className="object-cover transition-opacity duration-150 pointer-events-none"
        />

        {/* Subtle Refraction Glare */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-color-dodge transition-all duration-75"
          style={{
            background: `radial-gradient(circle at ${lightPosition} 40%, rgba(251, 191, 36, 0.4) 0%, rgba(56, 189, 248, 0.25) 30%, transparent 70%)`,
          }}
        />

        {/* Hint Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/90 backdrop-blur-xs px-3.5 py-1 text-[11px] text-stone-600 border border-stone-200 flex items-center gap-1.5 shadow-xs">
          <Compass className="h-3 w-3 text-stone-600" />
          <span>Drag horizontally to rotate facets</span>
        </div>
      </div>

      {/* Bottom Rotation Slider & Controls Bar */}
      <div className="border-t border-stone-200 bg-stone-50/80 p-3 sm:p-4 flex items-center gap-3">
        <button
          onClick={toggleAutoSpin}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 hover:text-stone-900 transition-colors shadow-xs"
          title={isAutoSpinning ? "Pause 360 rotation" : "Start 360 rotation"}
          aria-label="Toggle auto rotation"
        >
          {isAutoSpinning ? <Pause className="h-3.5 w-3.5 text-stone-800" /> : <Play className="h-3.5 w-3.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-stone-400">
            <span>0° Pavilion</span>
            <span>180° Profile</span>
            <span>360° Table</span>
          </div>
          <Slider
            min={0}
            max={359}
            step={1}
            value={[rotation]}
            onValueChange={(vals) => {
              setIsAutoSpinning(false);
              setRotation(vals[0]);
            }}
            className="py-1"
          />
        </div>

        <button
          onClick={() => {
            setRotation(0);
            toast.success("Reset view to 0° Table Face");
          }}
          className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors px-2 py-1"
        >
          <Sparkles className="h-3 w-3 text-stone-600" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}
