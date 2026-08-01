import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { addDays, format, startOfDay } from "date-fns";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const BOOKING_HORIZON_DAYS = 60;

function startOfDayMs(date = new Date()) {
  return startOfDay(date).getTime();
}

export function BookPage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const { isAuthenticated } = useConvexAuth();
  const services = useQuery(api.services.listPublic);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const createAppointment = useMutation(api.booking.createAppointment);

  const initialService = searchParams.get("service") as Id<"services"> | null;
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<Id<"services"> | null>(initialService);
  const [dateMs, setDateMs] = useState<number>(() => startOfDayMs());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefilledContact, setPrefilledContact] = useState(false);

  const minDateMs = useMemo(() => startOfDayMs(), []);
  const maxDateMs = useMemo(
    () => startOfDay(addDays(new Date(minDateMs), BOOKING_HORIZON_DAYS)).getTime(),
    [minDateMs],
  );

  const nowMs = Date.now();
  const slots = useQuery(
    api.booking.getAvailableSlots,
    serviceId ? { serviceId, dateMs, nowMs } : "skip",
  );

  const selectedService = useMemo(
    () => services?.find((s) => s._id === serviceId),
    [services, serviceId],
  );

  const singleOffering = services?.length === 1 ? services[0] : null;
  const stepFlow = singleOffering
    ? (["schedule", "confirm"] as const)
    : (["service", "schedule", "confirm"] as const);
  const currentStep = stepFlow[step - 1];

  useEffect(() => {
    if (singleOffering) {
      setServiceId(singleOffering._id);
    }
  }, [singleOffering]);

  useEffect(() => {
    if (prefilledContact || !currentUser) return;
    setEmail(currentUser.email);
    setName(currentUser.name);
    setPrefilledContact(true);
  }, [currentUser, prefilledContact]);

  function formatServicePrice(priceCents: number) {
    if (priceCents <= 0) return null;
    return `$${(priceCents / 100).toFixed(0)}`;
  }

  function handleSelectDate(nextDateMs: number) {
    setDateMs(nextDateMs);
    setSelectedSlot(null);
  }

  async function confirmBooking() {
    if (!serviceId || !selectedSlot) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email so we can add this booking to your account.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createAppointment({
        serviceId,
        startTime: selectedSlot,
        email: trimmedEmail,
        name: name.trim() || undefined,
        customerNotes: notes.trim() || undefined,
        nowMs: Date.now(),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <h1 className="font-serif text-3xl">You&apos;re booked!</h1>
        <p className="mt-3 text-muted-foreground">
          A confirmation email is on its way to <strong>{email.trim()}</strong>.
          Your appointment is saved to your account. Sign in with that email
          anytime to view or manage it.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/account">View appointments</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in to manage booking</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="font-serif text-4xl">Book a session</h1>
      <p className="mt-2 text-muted-foreground">
        Step {step} of {stepFlow.length}. Pick a date and time, then enter your
        email to save the booking.
      </p>

      {currentStep === "service" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Choose a service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(services ?? []).map((service) => {
              const price = formatServicePrice(service.priceCents);
              return (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => setServiceId(service._id)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition",
                    serviceId === service._id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40",
                  )}
                >
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {service.durationMinutes} min
                    {price ? ` · ${price}` : ""}
                  </div>
                </button>
              );
            })}
            <Button className="mt-4" disabled={!serviceId} onClick={() => setStep(2)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "schedule" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pick a date & time</CardTitle>
            <CardDescription>{selectedService?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <BookingCalendar
              selectedDateMs={dateMs}
              onSelectDate={handleSelectDate}
              minDateMs={minDateMs}
              maxDateMs={maxDateMs}
            />

            <div className="space-y-3 border-t pt-6">
              <div>
                <h3 className="font-medium">Available times</h3>
                <p className="text-sm text-muted-foreground">
                  {format(dateMs, "EEEE, MMMM d")}
                </p>
              </div>

              {slots === undefined && (
                <p className="text-sm text-muted-foreground">Loading times...</p>
              )}

              {slots?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No slots available this day. Try another date.
                </p>
              )}

              {!!slots?.length && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm transition",
                        selectedSlot === slot
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40",
                      )}
                    >
                      {format(slot, "h:mm a")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {!singleOffering && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button disabled={!selectedSlot} onClick={() => setStep(step + 1)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "confirm" && selectedService && selectedSlot && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your details & confirm</CardTitle>
            <CardDescription>
              Enter your email. We&apos;ll add this booking to your account, or
              create one if you&apos;re new.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 text-sm">
              <p>
                <strong>{selectedService.name}</strong>
              </p>
              <p>{format(selectedSlot, "EEEE, MMMM d 'at' h:mm a")}</p>
              {formatServicePrice(selectedService.priceCents) && (
                <p>{formatServicePrice(selectedService.priceCents)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes for the studio (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything we should know about your baby?"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
              <Button disabled={loading} onClick={() => void confirmBooking()}>
                {loading ? "Confirming..." : "Confirm booking"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
