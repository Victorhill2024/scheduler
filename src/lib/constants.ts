import type { Platform, PlatformConfig, PostStatus } from "./types";

export const BRAND = {
  name: "Crescere Consulting",
  product: "Scheduler",
  colors: {
    forest: "#0D3B3B",
    cream: "#FAF3E8",
    gold: "#E8A838",
    text: "#1a1a1a",
    border: "#E0E0E0",
  },
  fontFamily: "Manrope",
} as const;

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  instagram: {
    id: "instagram",
    label: "Instagram",
    characterLimit: 2200,
    aspectRatio: "1:1",
    requiresImage: true,
    brandColor: "#E4405F",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    characterLimit: 3000,
    aspectRatio: "1.91:1",
    requiresImage: false,
    brandColor: "#0A66C2",
  },
  twitter: {
    id: "twitter",
    label: "Twitter",
    characterLimit: 280,
    aspectRatio: "16:9",
    requiresImage: false,
    brandColor: "#1DA1F2",
  },
};

export const ALL_PLATFORMS: Platform[] = ["instagram", "linkedin", "twitter"];

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-100 text-blue-800",
  publishing: "bg-amber-100 text-amber-800",
  published: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

/** Notion property names — keep in sync with docs/NOTION_SCHEMA.md */
export const NOTION_PROPS = {
  title: "Title",
  caption: "Caption",
  imageUrl: "Image URL",
  imageAltText: "Image Alt Text",
  scheduledDateTime: "Scheduled DateTime",
  status: "Status",
  platforms: "Platforms",
  postedAt: "Posted At",
  instagramCaption: "Instagram Caption",
  linkedinSummary: "LinkedIn Summary",
  twitterText: "Twitter Text",
  errorLog: "Error Log",
  createdBy: "Created By",
} as const;
