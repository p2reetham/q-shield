import { ReactNode } from "react";

interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string;
  emptyLabel?: string;
}

export default function DataTable<T>({ columns, rows, keyField, emptyLabel = "No records yet" }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-graphite-700">
            {columns.map((c) => (
              <th key={c.header} className="data-label px-4 py-2 font-normal">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-graphite-500 text-sm">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={keyField(row)} className="border-b border-graphite-800 hover:bg-graphite-850/60 transition-colors">
              {columns.map((c) => (
                <td key={c.header} className={`px-4 py-2.5 align-middle ${c.className ?? ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
