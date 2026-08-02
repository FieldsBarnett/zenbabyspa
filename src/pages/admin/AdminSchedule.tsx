import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  combineStudioDateAndTime,
  formatStudioDateMedium,
  formatStudioMonthLabel,
  getStudioCalendarDays,
  getStudioDateKey,
  getStudioDayEndMs,
  getStudioDayStartMs,
  getStudioYearMonth,
  isStudioToday,
  shiftStudioYearMonth,
} from "@/lib/studioTimezone";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type BlockedEntry = {
  _id: Id<"blockedTimes">;
  startTime: number;
  endTime: number;
  reason: string;
};

function dayBounds(dateKey: string) {
  return {
    start: getStudioDayStartMs(dateKey),
    end: getStudioDayEndMs(dateKey),
  };
}

function isDateBlocked(dateKey: string, blocked: BlockedEntry[]) {
  const { start, end } = dayBounds(dateKey);
  return blocked.some((b) => b.startTime < end && b.endTime > start);
}

function blocksForDate(dateKey: string, blocked: BlockedEntry[]) {
  const { start, end } = dayBounds(dateKey);
  return blocked.filter((b) => b.startTime < end && b.endTime > start);
}

export function AdminSchedule() {
  const rules = useQuery(api.admin.schedule.listAvailabilityRules);
  const blocked = useQuery(api.admin.schedule.listBlockedTimes);
  const upsertRule = useMutation(api.admin.schedule.upsertAvailabilityRule);
  const createBlocked = useMutation(api.admin.schedule.createBlockedTime);
  const deleteBlocked = useMutation(api.admin.schedule.deleteBlockedTime);

  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [blockReason, setBlockReason] = useState("");
  const [partialDate, setPartialDate] = useState("");
  const [partialStart, setPartialStart] = useState("09:00");
  const [partialEnd, setPartialEnd] = useState("12:00");
  const [viewYearMonth, setViewYearMonth] = useState(() =>
    getStudioYearMonth(getStudioDateKey()),
  );
  const [togglingDateKey, setTogglingDateKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calendarDays = useMemo(
    () => getStudioCalendarDays(viewYearMonth),
    [viewYearMonth],
  );

  async function saveRule(ruleId?: Id<"availabilityRules">) {
    await upsertRule({
      ruleId,
      dayOfWeek,
      startTime,
      endTime,
      slotIntervalMinutes: 30,
      active: true,
    });
  }

  async function toggleDate(dateKey: string) {
    if (!blocked) return;

    setTogglingDateKey(dateKey);
    setError(null);
    setPartialDate(dateKey);

    try {
      const existing = blocksForDate(dateKey, blocked);
      if (existing.length > 0) {
        for (const entry of existing) {
          await deleteBlocked({ blockedTimeId: entry._id });
        }
      } else {
        const { start, end } = dayBounds(dateKey);
        await createBlocked({
          startTime: start,
          endTime: end,
          reason: blockReason.trim() || "Blocked",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update blocked date");
    } finally {
      setTogglingDateKey(null);
    }
  }

  async function addPartialBlock() {
    if (!partialDate) {
      setError("Choose a date for the partial-day block.");
      return;
    }

    const start = combineStudioDateAndTime(partialDate, partialStart);
    const end = combineStudioDateAndTime(partialDate, partialEnd);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    setError(null);
    try {
      await createBlocked({
        startTime: start,
        endTime: end,
        reason: blockReason.trim() || "Blocked",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block time");
    }
  }

  if (rules === undefined || blocked === undefined) {
    return (
      <div className="py-8 text-muted-foreground">Loading schedule settings...</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Schedule</h1>
        <p className="mt-2 text-muted-foreground">
          Manage weekly hours and blocked dates. All times are Eastern Time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Day</Label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
              >
                {dayNames.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Start</Label>
              <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End</Label>
              <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => void saveRule()}>Add rule</Button>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {rules.map((rule) => (
              <li
                key={rule._id}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <span>
                  {dayNames[rule.dayOfWeek]} {rule.startTime}–{rule.endTime} ET
                  {!rule.active && " (inactive)"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void upsertRule({
                      ruleId: rule._id,
                      dayOfWeek: rule.dayOfWeek,
                      startTime: rule.startTime,
                      endTime: rule.endTime,
                      slotIntervalMinutes: rule.slotIntervalMinutes,
                      active: !rule.active,
                    })
                  }
                >
                  {rule.active ? "Disable" : "Enable"}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blocked dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Click a date to block or unblock the whole day. Use the time fields
            below if you only need part of a day.
          </p>

          <div className="max-w-md">
            <Label htmlFor="block-reason">Reason</Label>
            <Input
              id="block-reason"
              className="mt-1"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Holiday, vacation..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setViewYearMonth((current) => shiftStudioYearMonth(current, -1))
                }
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="font-medium">{formatStudioMonthLabel(viewYearMonth)}</p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setViewYearMonth((current) => shiftStudioYearMonth(current, 1))
                }
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="py-2">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const blockedDay = isDateBlocked(cell.dateKey, blocked);
                const isToggling = togglingDateKey === cell.dateKey;
                const matchesPartial = partialDate === cell.dateKey;

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    disabled={isToggling}
                    onClick={() => void toggleDate(cell.dateKey)}
                    aria-label={`${cell.dateKey}, ${
                      blockedDay ? "blocked" : "open"
                    }. Click to toggle.`}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl border text-sm font-medium transition-colors disabled:cursor-wait",
                      blockedDay
                        ? "border-destructive/30 bg-destructive/5 text-muted-foreground opacity-70 hover:bg-destructive/10"
                        : "border-border bg-background hover:bg-accent",
                      matchesPartial && "ring-2 ring-primary ring-offset-1",
                      isStudioToday(cell.dateKey) &&
                        !blockedDay &&
                        "font-semibold text-primary",
                    )}
                  >
                    {blockedDay && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                      >
                        <span className="absolute left-1/2 top-1/2 h-px w-[141%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-destructive/45" />
                      </span>
                    )}
                    <span className="relative">{cell.day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div>
              <p className="font-medium">Partial-day block</p>
              <p className="text-sm text-muted-foreground">
                Block only part of a day without toggling the whole date.
                Clicking the calendar also fills the date field.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  className="mt-1"
                  value={partialDate}
                  onChange={(e) => setPartialDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Start</Label>
                <Input
                  type="time"
                  className="mt-1"
                  value={partialStart}
                  onChange={(e) => setPartialStart(e.target.value)}
                />
              </div>
              <div>
                <Label>End</Label>
                <Input
                  type="time"
                  className="mt-1"
                  value={partialEnd}
                  onChange={(e) => setPartialEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  disabled={!partialDate}
                  onClick={() => void addPartialBlock()}
                >
                  Block hours
                </Button>
              </div>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {blocked.length === 0 && (
              <li className="text-muted-foreground">No blocked dates yet.</li>
            )}
            {blocked.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <span>
                  {formatStudioDateMedium(b.startTime)} –{" "}
                  {formatStudioDateMedium(b.endTime)} · {b.reason}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void deleteBlocked({ blockedTimeId: b._id })}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
