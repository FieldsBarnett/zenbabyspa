import { useEffect } from "react";
import { Authenticated, useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ProfileSync({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const ensureProfile = useMutation(api.users.ensureProfileOnAuth);

  useEffect(() => {
    if (isAuthenticated) {
      void ensureProfile({});
    }
  }, [isAuthenticated, ensureProfile]);

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
