import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import type { DdtRecord } from "../types";

type Props = {
  records: DdtRecord[];
  selectedId?: string;
  onSelect: (record: DdtRecord) => void;
};

export function RecordTable({ records, selectedId, onSelect }: Props) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "scheduledDdt", desc: false }]);
  const columns: ColumnDef<DdtRecord>[] = [
    { header: "Dock", accessorKey: "dock" },
    { header: "Loader", accessorKey: "loader" },
    { header: "Driver", accessorKey: "driver" },
    { header: "Truck", accessorKey: "truck" },
    { header: "Flight 1", accessorFn: (row) => row.flights?.[0]?.flight ?? "" },
    { header: "Flight 2", accessorFn: (row) => row.flights?.[1]?.flight ?? "" },
    { header: "Flight 3", accessorFn: (row) => row.flights?.[2]?.flight ?? "" },
    { header: "Scheduled DDT", accessorKey: "scheduledDdt" },
    { header: "Seal Time", accessorKey: "sealTime" },
    { header: "Actual DDT", accessorKey: "actualDdt" },
    {
      id: "ddtVariance",
      header: "DDT Var",
      accessorFn: (row) => row.metrics.ddtVarianceMinutes ?? -999,
      cell: ({ row }) => (
        <span className={row.original.metrics.late ? "variance-pill late" : "variance-pill"}>
          {row.original.metrics.ddtVarianceLabel}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => row.metrics.status,
      cell: ({ row }) => (
        <span className={`status-pill ${row.original.metrics.status.toLowerCase().replace("-", "")}`}>
          {row.original.metrics.status}
        </span>
      ),
    },
  ];
  const table = useReactTable({
    data: records,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className="table-frame">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <button
                    type="button"
                    className="sort-header"
                    onClick={header.column.getToggleSortingHandler()}
                    disabled={!header.column.getCanSort()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span aria-hidden="true">
                      {header.column.getIsSorted() === "asc" ? "▲" : header.column.getIsSorted() === "desc" ? "▼" : ""}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.original.id}
              className={selectedId === row.original.id ? "selected" : ""}
              onClick={() => onSelect(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} data-status={cell.column.id === "Status" ? row.original.metrics.status : undefined}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
