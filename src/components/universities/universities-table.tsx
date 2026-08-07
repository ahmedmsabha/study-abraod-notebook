"use client";

import { useMemo, useState } from "react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { UniversityDialog } from "@/components/universities/university-dialog";
import { labelize } from "@/lib/format";
import {
  Priority,
  UniversityStatus,
} from "../../../generated/prisma/enums";

export type UniversityTableRow = {
  id: string;
  name: string;
  status: string;
  priority: string;
  facultyOrDepartment: string | null;
  country: { id: string; name: string; code: string };
  city: { id: string; name: string } | null;
  _count: { programs: number; professors: number; scholarships: number };
};

type Option = { id: string; name: string };

const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, UniversityTableRow>();

export function UniversitiesTable({
  universities,
  countries,
  cities,
  defaultOpenCreate = false,
}: {
  universities: UniversityTableRow[];
  countries: Option[];
  cities: Array<Option & { countryId: string }>;
  defaultOpenCreate?: boolean;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [countryId, setCountryId] = useState<string>("all");

  const filtered = useMemo(() => {
    return universities.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (priority !== "all" && row.priority !== priority) return false;
      if (countryId !== "all" && row.country.id !== countryId) return false;
      if (!globalFilter.trim()) return true;
      const q = globalFilter.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        row.country.name.toLowerCase().includes(q) ||
        (row.facultyOrDepartment ?? "").toLowerCase().includes(q) ||
        (row.city?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [universities, status, priority, countryId, globalFilter]);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "University",
          cell: (info) => (
            <Link
              href={`/universities/${info.row.original.id}`}
              className="font-medium hover:underline"
            >
              {info.getValue()}
            </Link>
          ),
        }),
        columnHelper.accessor((row) => row.country.name, {
          id: "country",
          header: "Country",
          cell: (info) => (
            <span>
              {info.getValue()}{" "}
              <span className="text-muted-foreground">
                ({info.row.original.country.code})
              </span>
            </span>
          ),
        }),
        columnHelper.accessor((row) => row.city?.name ?? "—", {
          id: "city",
          header: "City",
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => <StatusBadge value={info.getValue()} />,
        }),
        columnHelper.accessor("priority", {
          header: "Priority",
          cell: (info) => <StatusBadge value={info.getValue()} />,
        }),
        columnHelper.accessor((row) => row._count.programs, {
          id: "programs",
          header: "Programs",
        }),
        columnHelper.accessor((row) => row._count.professors, {
          id: "professors",
          header: "Professors",
        }),
      ]),
    [],
  );

  const table = useTable({
    features,
    columns,
    data: filtered,
  });

  if (universities.length === 0) {
    return (
      <EmptyState
        title="No universities yet"
        description="Add a university to start tracking programs and professors."
        action={
          <UniversityDialog
            countries={countries}
            cities={cities}
            defaultOpen={defaultOpenCreate}
          />
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="Search universities…"
            className="max-w-xs"
          />
          <Select value={countryId} onValueChange={(value) => setCountryId(value ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => setStatus(value ?? "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.values(UniversityStatus).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(value) => setPriority(value ?? "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {Object.values(Priority).map((value) => (
                <SelectItem key={value} value={value}>
                  {labelize(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <UniversityDialog
          countries={countries}
          cities={cities}
          defaultOpen={defaultOpenCreate}
        />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No universities match these filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
