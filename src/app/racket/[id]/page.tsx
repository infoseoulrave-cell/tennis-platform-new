import { permanentRedirect } from "next/navigation";

const legacyRacketDestinations: Record<string, string> = {
  "blade-98-v8": "/rackets/wilson-blade-98-16x19-v9-2024",
  "gravity-mp": "/rackets/head-gravity-mp-2025",
  "vcore-98": "/rackets/yonex-vcore-98-2026",
};

export function legacyRacketDestination(id: string): string {
  const normalized = id.trim().toLowerCase();
  const knownDestination = legacyRacketDestinations[normalized];
  if (knownDestination) return knownDestination;
  if (!normalized) return "/rackets";

  const query = new URLSearchParams({ q: id.trim().slice(0, 120) });
  return `/rackets?${query.toString()}`;
}

export default async function LegacyRacketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(legacyRacketDestination(id));
}
