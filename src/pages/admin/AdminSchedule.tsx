import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AdminSchedule() {
  const rules = useQuery(api.admin.schedule.listAvailabilityRules);
  const blocked = useQuery(api.admin.schedule.listBlockedTimes);
  const upsertRule = useMutation(api.admin.schedule.upsertAvailabilityRule);
  const createBlocked = useMutation(api.admin.schedule.createBlockedTime);
  const deleteBlocked = useMutation(api.admin.schedule.deleteBlockedTime);

  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

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

  async function addBlock() {
    if (!blockStart || !blockEnd) return;
    await createBlocked({
      startTime: new Date(blockStart).getTime(),
      endTime: new Date(blockEnd).getTime(),
      reason: blockReason || "Blocked",
    });
    setBlockStart("");
    setBlockEnd("");
    setBlockReason("");
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
          Manage weekly hours and blocked dates
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
                  {dayNames[rule.dayOfWeek]} {rule.startTime}–{rule.endTime}
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
          <CardTitle>Blocked times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Start</Label>
              <Input
                type="datetime-local"
                value={blockStart}
                onChange={(e) => setBlockStart(e.target.value)}
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="datetime-local"
                value={blockEnd}
                onChange={(e) => setBlockEnd(e.target.value)}
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Holiday, vacation..."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => void addBlock()}>Block dates</Button>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {blocked.map((b) => (
              <li
                key={b._id}
                className="flex items-center justify-between rounded border px-3 py-2"
              >
                <span>
                  {format(b.startTime, "MMM d, h:mm a")} –{" "}
                  {format(b.endTime, "MMM d, h:mm a")} · {b.reason}
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
