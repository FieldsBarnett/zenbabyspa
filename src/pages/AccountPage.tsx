import { Navigate } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../convex/_generated/api";
import { AuthenticatedProfile } from "@/hooks/useProfileSync";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function AccountContent() {
  const profile = useQuery(api.users.getMyProfile);
  const appointments = useQuery(api.booking.listMyAppointments);
  const cancelAppointment = useMutation(api.booking.cancelAppointment);

  if (profile === undefined || appointments === undefined) {
    return <div className="container py-16 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="font-serif text-4xl">Your account</h1>
      {profile && (
        <p className="mt-2 text-muted-foreground">
          {profile.name} · {profile.email}
        </p>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>Upcoming and past sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!appointments.length && (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          )}
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="font-medium">{appointment.service.name}</div>
                <div className="text-sm text-muted-foreground">
                  {format(appointment.startTime, "EEEE, MMM d 'at' h:mm a")}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    appointment.status === "confirmed" ? "default" : "secondary"
                  }
                >
                  {appointment.status}
                </Badge>
                {appointment.status === "confirmed" &&
                  appointment.startTime > Date.now() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void cancelAppointment({ appointmentId: appointment._id })
                      }
                    >
                      Cancel
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AccountGate() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  if (isLoading) {
    return <div className="container py-16 text-muted-foreground">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <AuthenticatedProfile>
      <AccountContent />
    </AuthenticatedProfile>
  );
}

export function AccountPage() {
  return <AccountGate />;
}
