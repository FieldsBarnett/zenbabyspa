import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAppointments() {
  const appointments = useQuery(api.admin.schedule.listAppointments, {});
  const updateAppointment = useMutation(api.admin.schedule.updateAppointment);

  return (
    <div>
      <h1 className="font-serif text-3xl">Appointments</h1>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(appointments ?? []).map((a) => (
            <div
              key={a._id}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium">
                  {a.customer.name} — {a.service.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(a.startTime, "EEE, MMM d 'at' h:mm a")} · {a.customer.email}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.status === "confirmed" ? "default" : "secondary"}>
                  {a.status}
                </Badge>
                {a.status === "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void updateAppointment({
                        appointmentId: a._id,
                        status: "cancelled",
                      })
                    }
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!appointments?.length && (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
