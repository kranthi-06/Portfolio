"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { clsx } from "clsx";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackIcon?: React.ReactNode;
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  fallbackIcon,
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // If no source or error occurred, show fallback
  if (!src || error) {
    return (
      <div className={clsx("flex items-center justify-center bg-background-elevated border border-line", className)}>
        {fallbackIcon || <ImageOff className="w-8 h-8 text-ink-muted opacity-50" />}
      </div>
    );
  }

  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 bg-background-elevated animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt || "Image"}
        className={clsx(
          "transition-opacity duration-700 ease-in-out w-full h-full object-cover",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
