/**
 * Zod schemas used by API route handlers and the create/edit form.
 */

import { z } from "zod";

import { ALL_PLATFORMS } from "./constants";

export const platformSchema = z.enum(["instagram", "linkedin", "twitter"]);

export const platformCaptionSchema = z.object({
  platform: platformSchema,
  caption: z.string().max(5000),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  caption: z.string().min(1, "Caption is required").max(5000),
  imageUrl: z.string().url().or(z.literal("")).optional(),
  imageAltText: z.string().max(500).optional(),
  scheduledDateTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Invalid date",
  }),
  platforms: z
    .array(platformSchema)
    .min(1, "Choose at least one platform")
    .refine((arr) => arr.every((p) => ALL_PLATFORMS.includes(p)), {
      message: "Unknown platform",
    }),
  platformCaptions: z.array(platformCaptionSchema).optional(),
  status: z
    .enum(["draft", "scheduled", "publishing", "published", "failed"])
    .optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  errorLog: z.string().optional(),
  postedAt: z.string().optional(),
});

export type CreatePostBody = z.infer<typeof createPostSchema>;
export type UpdatePostBody = z.infer<typeof updatePostSchema>;
