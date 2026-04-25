import { clsx, type ClassValue } from "clsx";
import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

import { PLATFORMS } from "./constants";
import type { Platform } from "./types";

/** Tailwind class merger (used by all UI primitives). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO datetime as "May 15, 2026 · 9:00 AM". */
export function formatScheduled(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy · h:mm a");
  } catch {
    return "—";
  }
}

/** Returns "in 3 days" / "5 hours ago" — null-safe. */
export function relativeTime(iso: string | undefined | null): string {
  if (!iso) return "";
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

/** Truncate text for table previews. */
export function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Returns true if the given ISO date is in the past. */
export function isInPast(iso: string): boolean {
  try {
    return isPast(parseISO(iso));
  } catch {
    return false;
  }
}

/** Pick the platform-specific caption if provided, else fall back to default. */
export function captionFor(
  platform: Platform,
  defaultCaption: string,
  overrides?: { platform: Platform; caption: string }[],
): string {
  const override = overrides?.find((c) => c.platform === platform);
  return override?.caption?.trim() || defaultCaption;
}

/** True if the caption exceeds the platform's character limit. */
export function isOverLimit(platform: Platform, text: string): boolean {
  return text.length > PLATFORMS[platform].characterLimit;
}

/** Tiny ID helper for client-only optimistic operations. */
export function tempId(): string {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}
