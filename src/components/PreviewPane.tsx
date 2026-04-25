"use client";

import { AlertTriangle, ImageOff } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformIcon } from "@/components/PlatformIcon";
import { PLATFORMS } from "@/lib/constants";
import { captionFor, cn, isOverLimit } from "@/lib/utils";
import type { Platform, PlatformCaption } from "@/lib/types";

interface PreviewPaneProps {
  caption: string;
  imageUrl?: string;
  imageAltText?: string;
  platforms: Platform[];
  overrides?: PlatformCaption[];
}

export function PreviewPane({
  caption,
  imageUrl,
  imageAltText,
  platforms,
  overrides,
}: PreviewPaneProps) {
  const visible = platforms.length ? platforms : (["instagram"] as Platform[]);
  const first = visible[0]!;

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-forest">Live preview</div>
      <Tabs defaultValue={first}>
        <TabsList className="w-full justify-start">
          {visible.map((p) => (
            <TabsTrigger key={p} value={p}>
              <PlatformIcon platform={p} size={14} />
              <span className="ml-1.5">{PLATFORMS[p].label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {visible.map((p) => {
          const text = captionFor(p, caption, overrides);
          const limit = PLATFORMS[p].characterLimit;
          const over = isOverLimit(p, text);
          return (
            <TabsContent key={p} value={p}>
              <PlatformPreview
                platform={p}
                caption={text}
                imageUrl={imageUrl}
                imageAltText={imageAltText}
                limit={limit}
                over={over}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

interface PlatformPreviewProps {
  platform: Platform;
  caption: string;
  imageUrl?: string;
  imageAltText?: string;
  limit: number;
  over: boolean;
}

function PlatformPreview({
  platform,
  caption,
  imageUrl,
  imageAltText,
  limit,
  over,
}: PlatformPreviewProps) {
  const len = caption.length;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream"
            style={{ backgroundColor: PLATFORMS[platform].brandColor }}
          >
            <PlatformIcon platform={platform} size={14} />
          </div>
          <div className="text-sm">
            <div className="font-semibold text-forest">Crescere Consulting</div>
            <div className="text-[11px] text-muted-foreground">
              Now · {PLATFORMS[platform].label}
            </div>
          </div>
        </div>
        <div className={cn("text-xs", over ? "text-red-600 font-semibold" : "text-muted-foreground")}>
          {len.toLocaleString()} / {limit.toLocaleString()}
        </div>
      </div>

      {platform === "instagram" && (
        <ImagePreview imageUrl={imageUrl} imageAltText={imageAltText} aspect="aspect-square" />
      )}
      {platform === "linkedin" && imageUrl && (
        <ImagePreview imageUrl={imageUrl} imageAltText={imageAltText} aspect="aspect-[1.91/1]" />
      )}
      {platform === "twitter" && imageUrl && (
        <ImagePreview imageUrl={imageUrl} imageAltText={imageAltText} aspect="aspect-[16/9]" />
      )}

      <div className="space-y-2 px-4 py-3">
        {over && (
          <div className="flex items-start gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Caption exceeds {PLATFORMS[platform].label}'s {limit.toLocaleString()}-character limit.
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {caption || (
            <span className="italic text-muted-foreground">Your caption will appear here.</span>
          )}
        </p>
      </div>
    </div>
  );
}

function ImagePreview({
  imageUrl,
  imageAltText,
  aspect,
}: {
  imageUrl?: string;
  imageAltText?: string;
  aspect: string;
}) {
  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center bg-cream-200 text-muted-foreground",
          aspect,
        )}
      >
        <ImageOff className="h-8 w-8" aria-hidden />
        <span className="ml-2 text-xs">No image</span>
      </div>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={imageAltText ?? ""}
      className={cn("w-full object-cover", aspect)}
      loading="lazy"
    />
  );
}
