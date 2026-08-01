import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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

export function BookPage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const { isAuthenticated } = useConvexAuth();
  const services = useQuery(api.services.listPublic);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const createAppointment = useMutation(api.booking.createAppointment);

  const initialService = searchParams.get("service") as Id<"services"> | null;
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<Id<"services"> | null>(initialService);
  const [dateMs, setDateMs] = useState<number>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefilledContact, setPrefilledContact] = useState(false);

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
    ? (["date", "time", "confirm"] as const)
    : (["service", "date", "time", "confirm"] as const);
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

  const dateOptions = useMemo(() => {
    const options = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      options.push(d.getTime());
    }
    return options;
  }, []);

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
          Your appointment is saved to your account — sign in with that email
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
        Step {step} of {stepFlow.length} — pick a date first, then we&apos;ll
        save the booking to your account with your email.
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

      {currentStep === "date" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pick a date</CardTitle>
            <CardDescription>{selectedService?.name}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {dateOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDateMs(d);
                  setSelectedSlot(null);
                }}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  dateMs === d ? "border-primary bg-primary/5" : "hover:border-primary/40",
                )}
              >
                {format(d, "EEE, MMM d")}
              </button>
            ))}
            <div className="col-span-full flex gap-2 pt-4">
              {!singleOffering && (
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
              )}
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "time" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pick a time</CardTitle>
            <CardDescription>{format(dateMs, "EEEE, MMMM d")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!slots?.length && (
              <p className="text-sm text-muted-foreground">No slots available this day.</p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {(slots ?? []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-sm",
                    selectedSlot === slot
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40",
                  )}
                >
                  {format(slot, "h:mm a")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
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
              Enter your email and we&apos;ll add this booking to your account
              automatically — or create one if you&apos;re new.
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
