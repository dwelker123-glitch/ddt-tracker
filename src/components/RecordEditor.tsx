import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ddtRecordSchema } from "../services/validation";
import type { DdtInputRecord, DdtRecord } from "../types";

type Props = {
  record: DdtRecord;
  onSave: (record: DdtInputRecord) => void;
  error?: string;
};

export function RecordEditor({ record, onSave, error }: Props) {
  const { register, handleSubmit, reset, formState } = useForm<DdtInputRecord>({
    defaultValues: record,
    resolver: zodResolver(ddtRecordSchema),
  });

  useEffect(() => reset(record), [record, reset]);

  return (
    <form
      className="editor-panel"
      onSubmit={handleSubmit((values) => onSave({ ...record, ...values, flights: record.flights }))}
    >
      <div className="panel-heading">
        <h2>Selected Departure</h2>
        <div className="editor-heading-actions">
          <span>Calculated</span>
          <button className="primary-button compact-save" type="submit" disabled={Boolean(record.closedAt)}>
            <Save size={15} />
            Save
          </button>
        </div>
      </div>
      <div className="form-grid">
        <label>Date<input type="date" {...register("date")} disabled={Boolean(record.closedAt)} /></label>
        <label>Shift<input {...register("shift")} disabled={Boolean(record.closedAt)} /></label>
        <label>Dock<input {...register("dock")} disabled={Boolean(record.closedAt)} /></label>
        <label>Loader<input {...register("loader")} disabled={Boolean(record.closedAt)} /></label>
        <label>Driver<input {...register("driver")} disabled={Boolean(record.closedAt)} /></label>
        <label>Truck<input {...register("truck")} disabled={Boolean(record.closedAt)} /></label>
        <label>Scheduled DDT<input {...register("scheduledDdt")} disabled={Boolean(record.closedAt)} /></label>
        <label>Actual DDT<input {...register("actualDdt")} disabled={Boolean(record.closedAt)} /></label>
        <label>Scheduled KAT<input {...register("scheduledKat")} disabled={Boolean(record.closedAt)} /></label>
        <label>Actual KAT<input {...register("actualKat")} disabled={Boolean(record.closedAt)} /></label>
        <label>Delay reason<input {...register("delayReason")} disabled={Boolean(record.closedAt)} /></label>
        <div className="readonly-grid compact-calcs" aria-label="System controlled calculated values">
          <div><span>DDT variance</span><strong>{record.metrics.ddtVarianceLabel}</strong></div>
          <div><span>KAT variance</span><strong>{record.metrics.katVarianceLabel}</strong></div>
          <div><span>On-time</span><strong>{record.metrics.status}</strong></div>
        </div>
        <label className="wide-field notes-field">
          Notes<textarea {...register("notes")} disabled={Boolean(record.closedAt)} />
        </label>
        <label className="wide-field comments-field">
          Operational comments<textarea {...register("operationalComments")} disabled={Boolean(record.closedAt)} />
        </label>
      </div>
      {formState.errors.date && <p className="error-text">Date is required.</p>}
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
