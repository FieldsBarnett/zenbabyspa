import { useEffect, useState } from "react";
import { Authenticated, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ProfileSync({ children }: { children: React.ReactNode }) {
  const ensureProfile = useMutation(api.users.ensureProfileOnAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ensureProfile]);

  if (!ready) {
    return (
      <div className="container py-16 text-muted-foreground">Loading...</div>
    );
  }

  return <>{children}</>;
}

export function AuthenticatedProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticated>
      <ProfileSync>{children}</ProfileSync>
    </Authenticated>
  );
}
