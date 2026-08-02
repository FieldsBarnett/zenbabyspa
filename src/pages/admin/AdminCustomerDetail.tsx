import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatStudioDateShort } from "@/lib/studioTimezone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminCustomerDetail() {
  const { id } = useParams();
  const profileId = id as Id<"userProfiles">;
  const data = useQuery(api.admin.customers.getCustomer, { profileId });
  const updateNotes = useMutation(api.admin.customers.updateCustomerNotes);

  const [adminNotes, setAdminNotes] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (data?.profile) {
      setAdminNotes(data.profile.adminNotes ?? "");
      setPhone(data.profile.phone ?? "");
    }
  }, [data]);

  if (data === undefined) {
    return <div className="text-muted-foreground">Loading...</div>;
  }
  if (!data) {
    return <div>Customer not found. <Link to="/admin/customers">Back</Link></div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/customers" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to customers
      </Link>
      <h1 className="font-serif text-3xl">{data.profile.name}</h1>
      <p className="text-muted-foreground">{data.profile.email}</p>

      <Card>
        <CardHeader>
          <CardTitle>CRM notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>Admin notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={() =>
              void updateNotes({
                profileId,
                adminNotes,
                phone: phone || undefined,
              })
            }
          >
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.appointments.map((a) => (
            <div key={a._id} className="flex justify-between border-b py-2">
              <span>
                {a.serviceName} · {a.status}
              </span>
              <span className="text-muted-foreground">
                {formatStudioDateShort(a.startTime)}
              </span>
            </div>
          ))}
          {!data.appointments.length && (
            <p className="text-muted-foreground">No appointments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
