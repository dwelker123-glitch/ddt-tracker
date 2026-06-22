import type { LocationId } from "../types";

export const locations: Array<{ id: LocationId; label: string; shortLabel: string }> = [
  { id: "Touhy", label: "Touhy DDT Entry", shortLabel: "Touhy" },
  { id: "Devon", label: "Devon DDT Entry", shortLabel: "Devon" },
];

export const locationLabel = (id: LocationId) =>
  locations.find((location) => location.id === id)?.shortLabel ?? id;

export const trackerPageForLocation = (id: LocationId) =>
  id === "Touhy" ? "Touhy DDT Entry" : "Devon DDT Entry";
