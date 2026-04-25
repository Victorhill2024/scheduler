"use client";

import { ALL_PLATFORMS, PLATFORMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Platform } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { PlatformIcon } from "@/components/PlatformIcon";

interface PlatformSelectorProps {
  value: Platform[];
  onChange: (next: Platform[]) => void;
  hasImage?: boolean;
}

export function PlatformSelector({ value, onChange, hasImage = false }: PlatformSelectorProps) {
  const toggle = (p: Platform) => {
    if (value.includes(p)) {
      onChange(value.filter((x) => x !== p));
    } else {
      onChange([...value, p]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ALL_PLATFORMS.map((p) => {
          const checked = value.includes(p);
          const config = PLATFORMS[p];
          const needsImage = config.requiresImage && !hasImage && checked;
          return (
            <label
              key={p}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border bg-card px-3 py-2.5 transition-colors",
                checked
                  ? "border-forest bg-cream-100"
                  : "border-border hover:border-forest/30",
                needsImage && "border-red-400 bg-red-50",
              )}
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(p)} />
              <PlatformIcon platform={p} size={18} />
              <div className="flex-1">
                <div className="text-sm font-medium text-forest">{config.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {config.characterLimit.toLocaleString()} char limit
                </div>
              </div>
            </label>
          );
        })}
      </div>
      {value.some((p) => PLATFORMS[p].requiresImage) && !hasImage && (
        <p className="text-xs text-red-600">
          Instagram requires an image. Add an Image URL to publish.
        </p>
      )}
    </div>
  );
}
