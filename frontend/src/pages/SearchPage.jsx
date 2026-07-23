import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { TableSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { useDebounce } from "../hooks/useDebounce";
import { usePagination } from "../hooks/usePagination";
import projectService from "../services/projectService";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setSearched(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSearched(true);
    projectService
      .search(debouncedQuery.trim())
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Search failed. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const { pageItems, page, totalPages, nextPage, prevPage, setPage } = usePagination(
    results || [],
    8
  );

  return (
    <DashboardLayout title="Search Projects">
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Find a project</h2>
        <p className="text-muted text-sm">
          Search before adding a new listing so duplicate projects don't get created.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <Input
          icon={MagnifyingGlassIcon}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search project name, ticker or website..."
          className="py-3.5 text-base shadow-soft"
        />
      </div>

      <Card className="max-w-5xl mx-auto overflow-hidden">
        {loading && <TableSkeleton rows={5} cols={4} />}

        {!loading && searched && results && results.length === 0 && (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title={`No matches for "${debouncedQuery}"`}
            description="Nothing found in the registry. If this is a new project, add it from the Upload Excel page."
          />
        )}

        {!loading && !searched && (
          <EmptyState
            icon={GlobeAltIcon}
            title="Start typing to search"
            description="Results from the shared registry will appear here instantly."
          />
        )}

        {!loading && results && results.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-primary-50/60">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3.5 font-semibold">Project</th>
                    <th className="px-5 py-3.5 font-semibold">Ticker</th>
                    <th className="px-5 py-3.5 font-semibold">Website</th>
                    <th className="px-5 py-3.5 font-semibold">Added By</th>
                    <th className="px-5 py-3.5 font-semibold">Date Added</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-line hover:bg-primary-50/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-primary">{p.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-semibold text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md text-xs">
                          {p.ticker}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={p.website?.startsWith("http") ? p.website : `https://${p.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline break-all"
                        >
                          {p.website}
                        </a>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{p.added_by}</td>
                      <td className="px-5 py-3.5 text-muted">
                        {new Date(p.date_added).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} onPage={setPage} />
          </>
        )}
      </Card>
    </DashboardLayout>
  );
}
