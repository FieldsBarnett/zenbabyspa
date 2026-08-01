import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MODALITIES = [
  "Warm hydrotherapy",
  "Parent–baby bonding massage",
  "Therapeutic sound therapy",
];

export function ServicesPage() {
  const services = useQuery(api.services.listPublic);
  const session = services?.[0];

  return (
    <div className="container py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl">The session</h1>
        <p className="mt-3 text-muted-foreground">
          One 45-minute visit in Sandy Springs. Hydrotherapy, bonding massage, and
          sound therapy, for infants 0–18 months with their caregiver.
        </p>
      </div>
      {session ? (
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">{session.name}</CardTitle>
            <CardDescription>{session.durationMinutes} minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {session.description}
            </p>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-primary">
                Included modalities
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                {MODALITIES.map((modality) => (
                  <li key={modality}>{modality}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2">
              {session.priceCents > 0 ? (
                <span className="text-lg font-medium">
                  ${(session.priceCents / 100).toFixed(0)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Pricing coming soon</span>
              )}
              <Button asChild>
                <Link to={`/book?service=${session._id}`}>Book this session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground">Loading session details...</p>
      )}
    </div>
  );
}
