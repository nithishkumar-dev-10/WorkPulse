import Papa from "papaparse";
import type { Employee, SchemaField } from "@/types/api";

export function downloadCsv(filename: string, rows: Record<string, string | number>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const text = [
    headers.map(escape).join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(",")),
  ].join("\n");

  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(file: File): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error(result.errors[0].message));
          return;
        }
        resolve(result.data as Employee[]);
      },
      error: (error) => reject(new Error(error.message)),
    });
  });
}

export function coerceRows(rows: Employee[], fields: SchemaField[]): Employee[] {
  const integerFields = new Set(
    fields.filter((field) => field.type === "integer").map((field) => field.name),
  );

  return rows.map((row) => {
    const next: Employee = {};
    for (const [key, value] of Object.entries(row)) {
      next[key] = integerFields.has(key) && value !== "" ? Number(value) : value;
    }
    return next;
  });
}

export function templateRows(fields: SchemaField[]): Record<string, string | number>[] {
  return [
    Object.fromEntries(fields.map((field) => [field.name, field.default])),
  ];
}
