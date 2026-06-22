export type LocationId = "Touhy" | "Devon";

export type Shift = "Tour 1" | "Tour 2" | "Tour 3" | "AM" | "PM" | "Overnight";

export type DdtStatus = "On-time" | "Late" | "Incomplete";

export type FlightLeg = {
  flight: string;
  category: string;
};

export type DdtInputRecord = {
  id: string;
  location: LocationId;
  trackerPage: "Touhy DDT Entry" | "Devon DDT Entry";
  date: string;
  shift: Shift;
  dock: string;
  opsx: string;
  loader: string;
  driver: string;
  truck: string;
  flights: FlightLeg[];
  scheduledDdt: string;
  actualDdt: string;
  scheduledKat: string;
  actualKat: string;
  delayReason: string;
  notes: string;
  operationalComments: string;
  manager?: string;
  supervisor?: string;
  closedAt?: string;
};

export type CalculatedMetrics = {
  ddtVarianceMinutes: number | null;
  katVarianceMinutes: number | null;
  ddtVarianceLabel: string;
  katVarianceLabel: string;
  status: DdtStatus;
  late: boolean;
  onTime: boolean;
};

export type DdtRecord = DdtInputRecord & {
  metrics: CalculatedMetrics;
};

export type HistoricalSnapshot = {
  id: string;
  location: LocationId;
  date: string;
  closedAt: string;
  records: DdtRecord[];
  summary: SummaryMetrics;
};

export type ScheduleRecord = {
  id: string;
  manager: string;
  supervisor: string;
  shift: string;
  startTime: string;
  endTime: string;
  area: string;
  date: string;
  location: LocationId;
};

export type SummaryMetrics = {
  totalDepartures: number;
  completedDepartures: number;
  onTimeDepartures: number;
  lateDepartures: number;
  compliance: number;
  averageVariance: number;
};

export type Filters = {
  dateRange: "7d" | "30d" | "90d" | "all";
  location: LocationId | "all";
  shift: string;
  driver: string;
  loader: string;
  truck: string;
  manager: string;
  supervisor: string;
};

export type PageId =
  | "touhy"
  | "devon"
  | "weekly"
  | "trends"
  | "schedule"
  | "import-export"
  | "admin";
