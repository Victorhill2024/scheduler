"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Loader2, Save, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlatformSelector } from "@/components/PlatformSelector";
import { ScheduleDatePicker } from "@/components/ScheduleDatePicker";
import { PreviewPane } from "@/components/PreviewPane";
import { PlatformIcon } from "@/components/PlatformIcon";
import { ALL_PLATFORMS, PLATFORMS } from "@/lib/constants";
import { cn, isOverLimit } from "@/lib/utils";
import type { CreatePostInput, Platform, PlatformCaption, Post } from "@/lib/types";

interface PostFormProps {
  initial?: Post;
  mode: "create" | "edit";
}

interface FormState {
  title: string;
  caption: string;
  imageUrl: string;
  imageAltText: string;
  scheduledDateTime: string;
  platforms: Platform[];
  platformCaptions: PlatformCaption[];
}

function emptyState(): FormState {
  return {
    title: "",
    caption: "",
    imageUrl: "",
    imageAltText: "",
    scheduledDateTime: "",
    platforms: [],
    platformCaptions: [],
  };
}

function fromPost(post: Post): FormState {
  return {
    title: post.title,
    caption: post.caption,
    imageUrl: post.imageUrl,
    imageAltText: post.imageAltText,
    scheduledDateTime: post.scheduledDateTime,
    platforms: post.platforms,
    platformCaptions: post.platformCaptions ?? [],
  };
}

export function PostForm({ initial, mode }: PostFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(initial ? fromPost(initial) : emptyState());
  const [showOverrides, setShowOverrides] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const setOverride = (platform: Platform, caption: string) => {
    setState((prev) => {
      const others = prev.platformCaptions.filter((c) => c.platform !== platform);
      return {
        ...prev,
        platformCaptions: caption ? [...others, { platform, caption }] : others,
      };
    });
  };

  const overrideFor = (platform: Platform): string =>
    state.platformCaptions.find((c) => c.platform === platform)?.caption ?? "";

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!state.title.trim()) errors.push("Title is required");
    if (!state.caption.trim()) errors.push("Caption is required");
    if (state.platforms.length === 0) errors.push("Select at least one platform");
    if (!state.scheduledDateTime) errors.push("Pick a scheduled date and time");
    state.platforms.forEach((p) => {
      const text = overrideFor(p) || state.caption;
      if (isOverLimit(p, text)) {
        errors.push(`${PLATFORMS[p].label} caption exceeds ${PLATFORMS[p].characterLimit} chars`);
      }
      if (PLATFORMS[p].requiresImage && !state.imageUrl) {
        errors.push(`${PLATFORMS[p].label} requires an image URL`);
      }
    });
    return errors;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const submit = (status: "draft" | "scheduled") => {
    if (status === "scheduled" && validation.length > 0) {
      setError(validation[0] ?? "Please fix the errors above.");
      return;
    }
    if (status === "draft" && !state.title.trim()) {
      setError("Add a title before saving a draft.");
      return;
    }
    setError(null);

    const body: CreatePostInput = {
      title: state.title.trim(),
      caption: state.caption,
      imageUrl: state.imageUrl || undefined,
      imageAltText: state.imageAltText || undefined,
      scheduledDateTime: state.scheduledDateTime,
      platforms: state.platforms,
      platformCaptions: state.platformCaptions.length ? state.platformCaptions : undefined,
      status,
    };

    startTransition(async () => {
      try {
        const url =
          mode === "edit" && initial ? `/api/posts/${initial.notionPageId}` : "/api/posts";
        const method = mode === "edit" ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error ?? `Request failed (${res.status})`);
        }
        router.push("/posts");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const remove = () => {
    if (!initial) return;
    if (!confirm("Delete this post? It will be archived in Notion.")) return;
    startTransition(async () => {
      const res = await fetch(`/api/posts/${initial.notionPageId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/posts");
        router.refresh();
      } else {
        setError("Failed to delete post");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
      {/* ---------- Left: form ---------- */}
      <div className="space-y-5">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Q2 Crescere Launch Announcement"
                value={state.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="caption">Caption</Label>
                <span className="text-xs text-muted-foreground">
                  {state.caption.length.toLocaleString()} chars
                </span>
              </div>
              <Textarea
                id="caption"
                placeholder="Share what you're announcing…"
                value={state.caption}
                onChange={(e) => set("caption", e.target.value)}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://cdn.example.com/post.jpg"
                  value={state.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alt">Image alt text</Label>
                <Input
                  id="alt"
                  placeholder="Crescere team celebrating product launch"
                  value={state.imageAltText}
                  onChange={(e) => set("imageAltText", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-1.5">
              <Label>Schedule</Label>
              <ScheduleDatePicker
                value={state.scheduledDateTime}
                onChange={(v) => set("scheduledDateTime", v)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Platforms</Label>
              <PlatformSelector
                value={state.platforms}
                onChange={(v) => set("platforms", v)}
                hasImage={Boolean(state.imageUrl)}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowOverrides((s) => !s)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-cream-100 px-3 py-2 text-sm font-medium text-forest hover:bg-cream-200"
            >
              <span>Platform-specific captions (optional)</span>
              {showOverrides ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {showOverrides && (
              <div className="space-y-3 animate-fade-in">
                {ALL_PLATFORMS.map((p) => (
                  <div key={p} className="space-y-1.5">
                    <Label className="flex items-center gap-1.5">
                      <PlatformIcon platform={p} size={14} />
                      {PLATFORMS[p].label} override
                    </Label>
                    <Textarea
                      rows={3}
                      placeholder={`Custom ${PLATFORMS[p].label} caption (defaults to main caption if blank)`}
                      value={overrideFor(p)}
                      onChange={(e) => setOverride(p, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {validation.length > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Before scheduling
            </div>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-amber-900">
              {validation.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled={pending} onClick={() => submit("draft")}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save as draft
            </Button>
            <Button
              variant="secondary"
              disabled={pending || validation.length > 0}
              onClick={() => submit("scheduled")}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Schedule post
            </Button>
          </div>
          {mode === "edit" && (
            <Button variant="destructive" disabled={pending} onClick={remove}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* ---------- Right: preview ---------- */}
      <div className={cn("lg:sticky lg:top-6", "lg:self-start")}>
        <Card>
          <CardContent className="p-5">
            <PreviewPane
              caption={state.caption}
              imageUrl={state.imageUrl}
              imageAltText={state.imageAltText}
              platforms={state.platforms}
              overrides={state.platformCaptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
