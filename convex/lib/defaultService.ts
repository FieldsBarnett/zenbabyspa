import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export const DEFAULT_SERVICE = {
  name: "45-Minute Hydrotherapy & Bonding Massage",
  description:
    "One unhurried visit combining warm hydrotherapy and parent–baby bonding massage — expert-led, gentle, and designed for babies 0–18 months with their caregiver.",
  durationMinutes: 45,
  priceCents: 0,
  active: true,
} as const;

const LEGACY_SERVICE_NAMES = new Set([
  "45-Minute Spa Session",
  "Warm hydrotherapy",
  "Parent–baby bonding massage",
  "Therapeutic sound therapy",
  "Hydrotherapy",
  "Bonding Massage",
  "Infant Massage",
]);

function isCanonicalCandidate(name: string) {
  return (
    name === DEFAULT_SERVICE.name ||
    LEGACY_SERVICE_NAMES.has(name) ||
    name.toLowerCase().includes("hydrotherapy") ||
    name.toLowerCase().includes("bonding")
  );
}

export async function ensureDefaultService(
  ctx: MutationCtx,
): Promise<Id<"services">> {
  const allServices = await ctx.db.query("services").collect();

  const canonical =
    allServices.find((service) => service.name === DEFAULT_SERVICE.name) ??
    allServices.find((service) => isCanonicalCandidate(service.name)) ??
    null;

  let canonicalId: Id<"services">;

  if (canonical) {
    await ctx.db.patch(canonical._id, {
      name: DEFAULT_SERVICE.name,
      description: DEFAULT_SERVICE.description,
      durationMinutes: DEFAULT_SERVICE.durationMinutes,
      priceCents:
        canonical.priceCents > 0
          ? canonical.priceCents
          : DEFAULT_SERVICE.priceCents,
      active: true,
    });
    canonicalId = canonical._id;
  } else {
    canonicalId = await ctx.db.insert("services", { ...DEFAULT_SERVICE });
  }

  for (const service of allServices) {
    if (service._id !== canonicalId && service.active) {
      await ctx.db.patch(service._id, { active: false });
    }
  }

  return canonicalId;
}
