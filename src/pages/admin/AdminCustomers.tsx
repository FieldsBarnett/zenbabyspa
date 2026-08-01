import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminCustomers() {
  const [search, setSearch] = useState("");
  const customers = useQuery(api.admin.customers.listCustomers, {
    search: search || undefined,
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Customers</h1>
      <p className="mt-2 text-muted-foreground">CRM — everyone who has signed up</p>

      <Input
        className="mt-6 max-w-md"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(customers ?? []).map((c) => (
            <Link
              key={c._id}
              to={`/admin/customers/${c._id}`}
              className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-secondary/50"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.email}</div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{c.appointmentCount} appointments</div>
                {c.lastAppointmentAt && (
                  <div>Last: {format(c.lastAppointmentAt, "MMM d, yyyy")}</div>
                )}
              </div>
            </Link>
          ))}
          {!customers?.length && (
            <p className="text-sm text-muted-foreground">No customers yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
