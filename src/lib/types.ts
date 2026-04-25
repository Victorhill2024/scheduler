/**
 * Scheduler — shared TypeScript types.
 *
 * These interfaces describe the unified shape of a post across the
 * three storage layers: Notion (source of truth), Supabase (queue),
 * and the dashboard UI.
 */

export type Platform = "instagram" | "linkedin" | "twitter";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type QueueStatus = "pending" | "publishing" | "published" | "failed";

export interface PlatformCaption {
  platform: Platform;
  caption: string;
}

export interface Post {
  id: string;
  notionPageId: string;
  title: string;
  caption: string;
  imageUrl: string;
  imageAltText: string;
  scheduledDateTime: string; // ISO 8601
  status: PostStatus;
  platforms: Platform[];
  platformCaptions?: PlatformCaption[];
  errorLog?: string;
  postedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsQueueItem {
  id: string;
  notionPageId: string;
  status: QueueStatus;
  scheduledAt: string;
  platforms: Platform[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/** Input shape for creating a new post via the API. */
export interface CreatePostInput {
  title: string;
  caption: string;
  imageUrl?: string;
  imageAltText?: string;
  scheduledDateTime: string;
  platforms: Platform[];
  platformCaptions?: PlatformCaption[];
  status?: PostStatus;
}

/** Input shape for updating an existing post via the API. */
export type UpdatePostInput = Partial<CreatePostInput> & {
  errorLog?: string;
  postedAt?: string;
};

export interface PlatformConfig {
  id: Platform;
  label: string;
  characterLimit: number;
  aspectRatio: string;
  requiresImage: boolean;
  brandColor: string;
}

export interface DashboardStats {
  totalPosts: number;
  scheduledNext7Days: number;
  publishedThisMonth: number;
  failedPosts: number;
}
