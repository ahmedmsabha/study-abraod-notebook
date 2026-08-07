"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SearchItem = {
  id: string;
  type: "University" | "Program" | "Professor" | "Scholarship" | "Country";
  title: string;
  subtitle?: string;
  href: string;
};

export function GlobalSearch({ items }: { items: SearchItem[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const results = useMemo(() => {
    if (!deferred) return [];
    return items
      .filter((item) => {
        const haystack = `${item.title} ${item.subtitle ?? ""} ${item.type}`.toLowerCase();
        return haystack.includes(deferred);
      })
      .slice(0, 8);
  }, [deferred, items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search universities, programs, professors…"
            className="ps-9"
            aria-label="Dashboard search"
          />
        </div>
        {deferred && results.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : null}
        <ul className="space-y-1">
          {results.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <Link
                href={item.href}
                className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type}
                  {item.subtitle ? ` · ${item.subtitle}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
