import { makeBlankRecord } from "./importExport";
import { complianceByDateAndLocation, withMetrics } from "./calculations";

describe("calculation trend helpers", () => {
  it("returns one trend row per date with separate Touhy and Devon compliance values", () => {
    const touhyRecord = {
      ...makeBlankRecord("Touhy"),
      id: "touhy-trend",
      date: "2026-06-20",
      scheduledDdt: "08:00",
      actualDdt: "08:00",
    };
    const devonRecord = {
      ...makeBlankRecord("Devon"),
      id: "devon-trend",
      date: "2026-06-20",
      scheduledDdt: "08:00",
      actualDdt: "08:12",
    };

    expect(complianceByDateAndLocation([withMetrics(touhyRecord), withMetrics(devonRecord)])).toEqual([
      { date: "2026-06-20", Touhy: 100, Devon: 0 },
    ]);
  });
});
