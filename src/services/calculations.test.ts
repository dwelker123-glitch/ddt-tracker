import { makeBlankRecord } from "./importExport";
import { complianceByDateAndLocation, hourlyPerformance, uniqueRecords, withMetrics } from "./calculations";

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

  it("summarizes DDT performance by scheduled hour", () => {
    const early = {
      ...makeBlankRecord("Touhy"),
      id: "hour-early",
      date: "2026-06-20",
      scheduledDdt: "08:10",
      actualDdt: "08:05",
    };
    const late = {
      ...makeBlankRecord("Touhy"),
      id: "hour-late",
      date: "2026-06-20",
      scheduledDdt: "08:45",
      actualDdt: "08:55",
    };
    const nextHour = {
      ...makeBlankRecord("Touhy"),
      id: "hour-next",
      date: "2026-06-20",
      scheduledDdt: "09:00",
      actualDdt: "09:00",
    };

    expect(hourlyPerformance([withMetrics(early), withMetrics(late), withMetrics(nextHour)])).toEqual([
      expect.objectContaining({
        label: "08:00",
        totalDepartures: 2,
        completedDepartures: 2,
        onTimeDepartures: 1,
        lateDepartures: 1,
        compliance: 50,
        averageVariance: 3,
      }),
      expect.objectContaining({
        label: "09:00",
        totalDepartures: 1,
        completedDepartures: 1,
        compliance: 100,
        averageVariance: 0,
      }),
    ]);
  });

  it("dedupes records by location, date, and record id", () => {
    const record = withMetrics({
      ...makeBlankRecord("Devon"),
      id: "dedupe-record",
      date: "2026-06-20",
      scheduledDdt: "08:00",
      actualDdt: "08:00",
    });

    expect(uniqueRecords([record, { ...record, driver: "Later Copy" }])).toHaveLength(1);
    expect(uniqueRecords([record, { ...record, id: "another-record" }])).toHaveLength(2);
  });
});
