import type { LocationId } from "../types";

export const locations: Array<{ id: LocationId; label: string; shortLabel: string }> = [
  { id: "touhy", label: "Touhy", shortLabel: "Touhy" },
  { id: "devon-a", label: "Devon DDT Entry A", shortLabel: "Devon A" },
  { id: "devon-b", label: "Devon DDT Entry B", shortLabel: "Devon B" },
];

export const locationLabel = (id: LocationId) =>
  locations.find((location) => location.id === id)?.shortLabel ?? id;
