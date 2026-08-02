import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ServiceForm = {
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  active: boolean;
};

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  durationMinutes: 45,
  priceCents: 8500,
  active: true,
};

export function AdminServices() {
  const services = useQuery(api.admin.schedule.listServices);
  const upsertService = useMutation(api.admin.schedule.upsertService);
  const deleteService = useMutation(api.admin.schedule.deleteService);
  const reorderServices = useMutation(api.admin.schedule.reorderServices);

  const [editingId, setEditingId] = useState<Id<"services"> | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(service: NonNullable<typeof services>[number]) {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description,
      durationMinutes: service.durationMinutes,
      priceCents: service.priceCents,
      active: service.active,
    });
    setError(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertService({
        serviceId: editingId ?? undefined,
        name: form.name.trim(),
        description: form.description.trim(),
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents,
        active: form.active,
      });
      startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(serviceId: Id<"services">) {
    if (!window.confirm("Delete this service? This cannot be undone.")) {
      return;
    }
    setError(null);
    try {
      await deleteService({ serviceId });
      if (editingId === serviceId) {
        startCreate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
    }
  }

  async function moveService(index: number, direction: -1 | 1) {
    if (!services) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= services.length) return;

    const ordered = services.map((service) => service._id);
    const [removed] = ordered.splice(index, 1);
    if (!removed) return;
    ordered.splice(nextIndex, 0, removed);

    setError(null);
    try {
      await reorderServices({ serviceIds: ordered });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder services");
    }
  }

  async function toggleActive(
    serviceId: Id<"services">,
    active: boolean,
    service: NonNullable<typeof services>[number],
  ) {
    setError(null);
    try {
      await upsertService({
        serviceId,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        priceCents: service.priceCents,
        imageUrl: service.imageUrl,
        active: !active,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update service");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl">Services</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create, edit, and reorder offerings. Order controls how they appear in booking.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{editingId ? "Edit service" : "Add service"}</CardTitle>
          {editingId && (
            <Button variant="outline" size="sm" onClick={startCreate}>
              Cancel edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  durationMinutes: Number(e.target.value),
                }))
              }
            />
          </div>
          <div>
            <Label>Price (cents)</Label>
            <Input
              type="number"
              value={form.priceCents}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  priceCents: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update service" : "Save service"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(services ?? []).map((service, index) => (
          <div
            key={service._id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-muted-foreground">
                {service.durationMinutes} min · $
                {(service.priceCents / 100).toFixed(0)}
                {!service.active && " · inactive"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => void moveService(index, -1)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Move down"
                disabled={!services || index === services.length - 1}
                onClick={() => void moveService(index, 1)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startEdit(service)}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void toggleActive(service._id, service.active, service)
                }
              >
                {service.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleDelete(service._id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
