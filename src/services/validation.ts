import { z } from "zod";

export const ddtRecordSchema = z.object({
  location: z.enum(["Touhy", "Devon"]),
  trackerPage: z.enum(["Touhy DDT Entry", "Devon DDT Entry"]).optional(),
  date: z.string().min(1),
  shift: z.string().min(1),
  dock: z.string().min(1),
  opsx: z.string().optional(),
  loader: z.string().min(1),
  driver: z.string().optional(),
  truck: z.string().optional(),
  flights: z.array(z.object({ flight: z.string(), category: z.string() })).optional(),
  scheduledDdt: z.string().min(1),
  actualDdt: z.string().optional(),
  scheduledKat: z.string().optional(),
  actualKat: z.string().optional(),
  delayReason: z.string().optional(),
  notes: z.string().optional(),
  operationalComments: z.string().optional(),
  manager: z.string().optional(),
  supervisor: z.string().optional(),
  closedAt: z.string().optional(),
});

export const scheduleSchema = z.object({
  manager: z.string().min(1),
  supervisor: z.string().min(1),
  shift: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  area: z.string().min(1),
  date: z.string().min(1),
  location: z.enum(["Touhy", "Devon"]),
});
