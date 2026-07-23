import { useState } from "react";
import { MagnifyingGlassIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { TableSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { usePagination } from "../hooks/usePagination";
import projectService from "../services/projectService";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setSearched(false);
      return;
    }
    setSubmittedQuery(trimmed);
    setLoading(true);
    setSearched(true);
    projectService
      .search(trimmed)
      .then((data) => setResults(data))
      .catch(() => toast.error("Search failed. Please try again."))
      .finally(() => setLoading(false));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };

  const { pageItems, page, totalPages, nextPage, prevPage, setPage } = usePagination(
    results || [],
    8
  );

  return (
    <DashboardLayout title="Search Projects">
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-primary mb-1.5">Find a project</h2>
        <p className="text-muted text-sm">
          Type the full ticker or project name and press Enter to check if it already exists.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-6 flex gap-2">
        <Input
          icon={MagnifyingGlassIcon}
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type ticker or project name, then press Enter..."
          className="py-3.5 text-base shadow-soft flex-1"
        />
        <button
          onClick={runSearch}
          className="px-5 rounded-lg bg-accent text-white font-medium shadow-soft hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </div>

      <Card className="max-w-5xl mx-auto overflow-hidden">
        {loading && <TableSkeleton rows={5} cols={4} />}

        {!loading && searched && results && results.length === 0 && (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title={`No matches for "${submittedQuery}"`}
            description="This project doesn't exist in the registry yet. You can add it from the Upload Excel page."
          />
        )}

        {!loading && !searched && (
          <EmptyState
            icon={GlobeAltIcon}
            title="Type a ticker or name and press Enter"
            description="Results from the shared registry will appear here."
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
