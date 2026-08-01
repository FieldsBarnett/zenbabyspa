import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const appointments = useQuery(api.admin.schedule.listAppointments, {});

  const upcoming =
    appointments?.filter(
      (a) => a.status === "confirmed" && a.startTime >= Date.now(),
    ) ?? [];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Studio overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{upcoming.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total loaded</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {appointments?.length ?? "—"}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Next appointments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.slice(0, 5).map((a) => (
            <div key={a._id} className="flex justify-between text-sm">
              <span>
                {a.customer.name} — {a.service.name}
              </span>
              <span className="text-muted-foreground">
                {format(a.startTime, "MMM d, h:mm a")}
              </span>
            </div>
          ))}
          {!upcoming.length && (
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
