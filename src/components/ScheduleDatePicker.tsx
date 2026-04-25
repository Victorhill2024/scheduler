"use client";

import { useMemo } from "react";
import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";
import { Calendar, Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleDatePickerProps {
  value: string; // ISO string or ""
  onChange: (next: string) => void;
}

/** Splits an ISO datetime into <input type="date"> + <input type="time"> values. */
function splitIso(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  try {
    const d = parseISO(iso);
    return {
      date: format(d, "yyyy-MM-dd"),
      time: format(d, "HH:mm"),
    };
  } catch {
    return { date: "", time: "" };
  }
}

function joinIso(date: string, time: string): string {
  if (!date) return "";
  const t = time || "09:00";
  // Local time → ISO. Browser interprets the date in local TZ, then we serialize as ISO.
  const d = new Date(`${date}T${t}`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export function ScheduleDatePicker({ value, onChange }: ScheduleDatePickerProps) {
  const { date, time } = splitIso(value);

  const helper = useMemo(() => {
    if (!value) return null;
    try {
      const d = parseISO(value);
      if (isPast(d)) {
        return {
          message: "This date is in the past — post will publish on next cron run.",
          tone: "warn" as const,
        };
      }
      return {
        message: `Scheduled ${formatDistanceToNow(d, { addSuffix: true })}`,
        tone: "info" as const,
      };
    } catch {
      return null;
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="schedule-date" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> Date
          </Label>
          <Input
            id="schedule-date"
            type="date"
            value={date}
            onChange={(e) => onChange(joinIso(e.target.value, time))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="schedule-time" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Time
          </Label>
          <Input
            id="schedule-time"
            type="time"
            value={time}
            onChange={(e) => onChange(joinIso(date, e.target.value))}
          />
        </div>
      </div>
      {helper && (
        <p
          className={
            helper.tone === "warn"
              ? "text-xs text-amber-700"
              : "text-xs text-muted-foreground"
          }
        >
          {helper.message}
        </p>
      )}
    </div>
  );
}
