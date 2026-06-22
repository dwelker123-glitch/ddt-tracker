import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { DdtRecord } from "../types";

type Props = {
  records: DdtRecord[];
  selectedId?: string;
  onSelect: (record: DdtRecord) => void;
};

export function RecordTable({ records, selectedId, onSelect }: Props) {
  const columns: ColumnDef<DdtRecord>[] = [
    { header: "Dock", accessorKey: "dock" },
    { header: "OPSX", accessorKey: "opsx" },
    { header: "Loader", accessorKey: "loader" },
    { header: "Driver", accessorKey: "driver" },
    { header: "Truck", accessorKey: "truck" },
    { header: "Flight 1", accessorFn: (row) => row.flights?.[0]?.flight ?? "" },
    { header: "Flight 2", accessorFn: (row) => row.flights?.[1]?.flight ?? "" },
    { header: "Flight 3", accessorFn: (row) => row.flights?.[2]?.flight ?? "" },
    { header: "Scheduled DDT", accessorKey: "scheduledDdt" },
    { header: "Actual DDT", accessorKey: "actualDdt" },
    { header: "DDT Var", accessorFn: (row) => row.metrics.ddtVarianceLabel },
    { header: "Scheduled KAT", accessorKey: "scheduledKat" },
    { header: "Actual KAT", accessorKey: "actualKat" },
    { header: "Status", accessorFn: (row) => row.metrics.status },
  ];
  const table = useReactTable({ data: records, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="table-frame">
      <table className="data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
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
