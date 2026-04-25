import { Instagram, Linkedin, Twitter } from "lucide-react";

import { PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/types";

const ICONS = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
} as const;

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
  withLabel?: boolean;
}

export function PlatformIcon({ platform, size = 16, className, withLabel }: PlatformIconProps) {
  const Icon = ICONS[platform];
  const config = PLATFORMS[platform];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon size={size} style={{ color: config.brandColor }} aria-hidden />
      {withLabel && <span className="text-sm">{config.label}</span>}
    </span>
  );
}

export function PlatformIconList({
  platforms,
  size = 14,
}: {
  platforms: Platform[];
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {platforms.map((p) => (
        <PlatformIcon key={p} platform={p} size={size} />
      ))}
    </span>
  );
}
