"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { ImageOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "onError" | "onLoad"> {
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
  useNextImage?: boolean;
}

export function SafeImage({ 
  src, 
  alt, 
  className, 
  containerClassName, 
  fallbackIcon,
  useNextImage = false,
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const isInvalidUrl = !src || typeof src !== 'string' || src.trim() === '';
  const isExternal = typeof src === 'string' && src.startsWith('http');

  const renderFallback = () => (
    <div className={cn("flex flex-col items-center justify-center w-full h-full bg-zinc-900/50 backdrop-blur-sm border border-white/5", containerClassName, className)}>
      {fallbackIcon || <ImageOff className="w-8 h-8 text-zinc-600 mb-2" />}
      <span className="text-xs text-zinc-500 font-medium">Image not available</span>
    </div>
  );

  const renderLoading = () => (
    <div className={cn("absolute inset-0 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm z-10", loading ? "opacity-100" : "opacity-0 pointer-events-none transition-opacity duration-300")}>
      <Loader2 className="w-6 h-6 text-primary/50 animate-spin" />
    </div>
  );

  if (isInvalidUrl || error) {
    return renderFallback();
  }

  return (
    <div className={cn("relative overflow-hidden w-full h-full", containerClassName)}>
      {renderLoading()}
      
      {useNextImage ? (
        <Image
          src={src}
          alt={alt || "Image"}
          className={cn(className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-500")}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          unoptimized={isExternal}
          {...props}
        />
      ) : (
        <img
          src={src as string}
          alt={alt || "Image"}
          className={cn("w-full h-full", className, loading ? "opacity-0" : "opacity-100 transition-opacity duration-500")}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          onLoad={() => setLoading(false)}
          loading={props.priority ? "eager" : "lazy"}
          {...(props as any)}
        />
      )}
    </div>
  );
}
