import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SiteLayout() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const { pathname } = useLocation();
  const onLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors",
          onLanding
            ? "border-b border-transparent bg-gradient-to-b from-background/80 to-transparent backdrop-blur-[2px]"
            : "border-b border-border/60 bg-card/85 backdrop-blur-sm",
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <Link
            to="/"
            className="font-serif text-xl tracking-tight text-foreground"
          >
            <span className="md:hidden">ZBS</span>
            <span className="hidden md:inline">Zen Baby Studio</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm md:gap-6">
            <NavLink
              to="/services"
              className={({ isActive }) =>
                cn(
                  "text-foreground/80 transition-colors hover:text-primary",
                  isActive && "font-medium text-primary",
                )
              }
            >
              Services
            </NavLink>
            <Authenticated>
              <NavLink
                to="/book"
                className={({ isActive }) =>
                  cn(
                    "text-foreground/80 transition-colors hover:text-primary",
                    isActive && "font-medium text-primary",
                  )
                }
              >
                Book
              </NavLink>
              <NavLink
                to="/account"
                className={({ isActive }) =>
                  cn(
                    "text-foreground/80 transition-colors hover:text-primary",
                    isActive && "font-medium text-primary",
                  )
                }
              >
                Account
              </NavLink>
              {currentUser?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      "text-foreground/80 transition-colors hover:text-primary",
                      isActive && "font-medium text-primary",
                    )
                  }
                >
                  Admin
                </NavLink>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void authClient.signOut()}
              >
                Sign out
              </Button>
            </Authenticated>
            <Unauthenticated>
              <Button asChild size="sm" className="uppercase tracking-[0.14em]">
                <Link to="/auth">Sign in</Link>
              </Button>
            </Unauthenticated>
          </nav>
        </div>
      </header>
      <main className={cn(!onLanding && "pt-16")}>
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-card/40 py-12">
        <div className="container flex flex-col gap-8 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-lg text-foreground">Zen Baby Studio</p>
            <p className="mt-2 max-w-xs leading-relaxed">
              45-minute infant spa sessions in Sandy Springs: hydrotherapy, bonding
              massage, and sound therapy.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-foreground">
              Studio
            </p>
            <p className="mt-3">Sandy Springs, GA</p>
            <p>Address coming soon</p>
            <p>Hours coming soon</p>
          </div>
          <nav className="flex flex-col gap-2" aria-label="Footer">
            <Link to="/services" className="transition-colors hover:text-primary">
              Services
            </Link>
            <Link to="/book" className="transition-colors hover:text-primary">
              Book a session
            </Link>
            <Link to="/auth" className="transition-colors hover:text-primary">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
