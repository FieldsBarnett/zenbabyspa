import { Link, NavLink, Outlet, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/schedule", label: "Schedule" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/emails", label: "Emails" },
];

export function AdminLayout() {
  const currentUser = useQuery(api.auth.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="container py-16 text-muted-foreground">Loading...</div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/admin" className="font-medium">
            Admin Panel
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to site
          </Link>
        </div>
      </header>
      <div className="container grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
