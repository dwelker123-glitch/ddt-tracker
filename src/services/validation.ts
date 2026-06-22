import { z } from "zod";

export const ddtRecordSchema = z.object({
  location: z.enum(["touhy", "devon-a", "devon-b"]),
  date: z.string().min(1),
  shift: z.string().min(1),
  dock: z.string().min(1),
  loader: z.string().min(1),
  scheduledDdt: z.string().min(1),
});

export const scheduleSchema = z.object({
  manager: z.string().min(1),
  supervisor: z.string().min(1),
  shift: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  area: z.string().min(1),
  date: z.string().min(1),
  location: z.enum(["touhy", "devon-a", "devon-b"]),
});
