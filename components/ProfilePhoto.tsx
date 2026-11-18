"use client";

import Image from "next/image";
import { UserRound } from "lucide-react";
import { useState } from "react";

type ProfilePhotoProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function ProfilePhoto({
  src,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
}: ProfilePhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${className} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {!loaded && !failed && (
        <div
          aria-hidden="true"
          className="photo-placeholder absolute inset-0 animate-pulse"
        />
      )}
      {failed && (
        <div
          aria-hidden={alt.length === 0}
          aria-label={alt || undefined}
          role={alt.length > 0 ? "img" : undefined}
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-2 to-bg text-muted"
        >
          <UserRound aria-hidden="true" size={40} strokeWidth={1.4} />
        </div>
      )}
    </>
  );
}
