import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SZButton } from "../../components/ui/SZButton";
import { SZTable } from "../../components/ui/SZTable";
import ClientFormModal, {
  Client,
} from "../../components/modals/ClientFormModal";
import useClients from "../../lib/hooks/useClients";
import SearchAndFilterBar, {
  FilterOption,
} from "../../components/search/SearchAndFilterBar";
import FilterPanel, {
  AppliedFilters,
  FilterDefinition,
} from "../../components/ui/filters/FilterPanel";
import ActiveFiltersDisplay from "../../components/ui/filters/ActiveFiltersDisplay";
import { LoadingState, EmptyState, ErrorState } from "../../components/states";

const ClientsPage: React.FC = () => {
  const [
    clients,
    { loading, error, createClient, updateClient, deleteClient },
  ] = useClients();
  const [active, setActive] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  const [params, setParams] = useSearchParams();
  const initialSearch = params.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);

  const initialFilters: AppliedFilters = {
    status: params.get("status") ?? "",
    created: { start: params.get("from") ?? "", end: params.get("to") ?? "" },
  };
  const [filters, setFilters] = useState<AppliedFilters>(initialFilters);

  const searchFilterOptions: FilterOption[] = [
    { key: "status", label: "Status", options: ["active", "inactive"] },
  ];

  const filterDefs: FilterDefinition[] = [
    { key: "created", label: "Created Date", type: "dateRange" },
  ];

  const handleSave = async (data: Client) => {
    try {
      if (data.id) {
        await updateClient(data.id, {
          name: data.name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          address: data.address,
        });
      } else {
        await createClient({
          name: data.name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          address: data.address,
        });
      }
      setOpen(false);
      setActive(null);
    } catch (err) {
      console.error("Failed to save client", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
    } catch (err) {
      console.error("Failed to delete client", err);
    }
  };

  const handleSearch = (term: string) => {
    setSearch(term);
    const p = new URLSearchParams(params);
    if (term) {
      p.set("search", term);
    } else {
      p.delete("search");
    }
    setParams(p);
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const applyFilters = (vals: AppliedFilters) => {
    setFilters(vals);
    const p = new URLSearchParams(params);
    if (vals.status) p.set("status", vals.status as string);
    else p.delete("status");
    if (vals.created?.start) p.set("from", vals.created.start);
    else p.delete("from");
    if (vals.created?.end) p.set("to", vals.created.end);
    else p.delete("to");
    setParams(p);
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters } as any;
    delete newFilters[key];
    setFilters(newFilters);
    const p = new URLSearchParams(params);
    if (key === "status") p.delete("status");
    if (key === "created") {
      p.delete("from");
      p.delete("to");
    }
    if (key === "search") {
      setSearch("");
      p.delete("search");
    }
    setParams(p);
  };

  const clearAll = () => {
    setFilters({ status: "", created: { start: "", end: "" } });
    const p = new URLSearchParams(params);
    ["search", "status", "from", "to"].forEach((k) => p.delete(k));
    setParams(p);
    setSearch("");
  };

  const filtered = useMemo(() => {
    let list = clients;
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name ?? "").toLowerCase().includes(term) ||
          (c.contact_email ?? "").toLowerCase().includes(term) ||
          (c.phone ?? "").toLowerCase().includes(term),
      );
    }
    if (filters.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters.created?.start) {
      list = list.filter(
        (c) => c.created_at && c.created_at >= filters.created.start!,
      );
    }
    if (filters.created?.end) {
      list = list.filter(
        (c) => c.created_at && c.created_at <= filters.created.end!,
      );
    }
    return list;
  }, [clients, search, filters]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <SZButton
          size="sm"
          onClick={() => {
            setActive(null);
            setOpen(true);
          }}
        >
          Add Client
        </SZButton>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <SearchAndFilterBar
          searchPlaceholder="Search clients"
          filters={searchFilterOptions}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
        <FilterPanel
          filters={filterDefs}
          onApply={applyFilters}
          initialState={filters}
        />
      </div>

      <ActiveFiltersDisplay
        filters={{ ...filters, ...(search ? { search } : {}) }}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />

      <div className="overflow-x-auto">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} />
        ) : filtered.length === 0 ? (
          <EmptyState message="No clients found" />
          ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Showing {filtered.length} of {clients.length} results
            </p>
            <SZTable
              headers={["Name", "Contact", "Email", "Address", "Actions"]}
            >
              {filtered.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">{c.contact_name}</td>
                  <td className="p-2 border">{c.contact_email}</td>
                  <td className="p-2 border">{c.address}</td>
                  <td className="p-2 border space-x-2">
                    <SZButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setActive(c);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </SZButton>
                    <SZButton
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(c.id!)}
                    >
                      Delete
                    </SZButton>
                  </td>
                </tr>
              ))}
            </SZTable>
          </>
        )}
      </div>

      <ClientFormModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initialData={active}
      />
    </div>
  );
};

export default ClientsPage;
