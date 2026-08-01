import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminServices() {
  const services = useQuery(api.admin.schedule.listServices);
  const upsertService = useMutation(api.admin.schedule.upsertService);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priceCents, setPriceCents] = useState(8500);

  async function handleCreate() {
    await upsertService({
      name,
      description,
      durationMinutes,
      priceCents,
      active: true,
    });
    setName("");
    setDescription("");
  }

  async function toggleActive(
    serviceId: Id<"services">,
    active: boolean,
    service: NonNullable<typeof services>[number],
  ) {
    await upsertService({
      serviceId,
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      imageUrl: service.imageUrl,
      active: !active,
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Services</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add service</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Price (cents)</Label>
            <Input
              type="number"
              value={priceCents}
              onChange={(e) => setPriceCents(Number(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={() => void handleCreate()}>Save service</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(services ?? []).map((service) => (
          <div
            key={service._id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-muted-foreground">
                {service.durationMinutes} min · ${(service.priceCents / 100).toFixed(0)}
                {!service.active && " · inactive"}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void toggleActive(service._id, service.active, service)}
            >
              {service.active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
