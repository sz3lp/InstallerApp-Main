import React, { useEffect, useMemo, useState } from "react";
import { SZInput } from "../../components/ui/SZInput";
import { SZTable } from "../../components/ui/SZTable";
import { GlobalEmpty, GlobalError, GlobalLoading } from "../../components/global-states";
import supabase from "../../lib/supabaseClient";

interface DirectoryRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
}

const SalesDirectoryPage: React.FC = () => {
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, users(full_name, email, phone)")
        .in("role", ["Sales", "Installer"])
        .order("users.full_name", { ascending: true });
      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        const mapped = (data ?? []).map((r: any) => ({
          id: r.user_id,
          full_name: r.users?.full_name ?? null,
          email: r.users?.email ?? null,
          phone: r.users?.phone ?? null,
          role: r.role ?? null,
        }));
        setRows(mapped);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = rows;
    if (roleFilter) list = list.filter((r) => r.role === roleFilter);
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.full_name ?? "").toLowerCase().includes(term) ||
          (r.email ?? "").toLowerCase().includes(term) ||
          (r.phone ?? "").toLowerCase().includes(term),
      );
    }
    return list;
  }, [rows, search, roleFilter]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Sales Directory</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <SZInput id="search" label="Search" value={search} onChange={setSearch} />
        </div>
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="Sales">Sales</option>
            <option value="Installer">Installer</option>
          </select>
        </div>
      </div>
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} />
      ) : filtered.length === 0 ? (
        <GlobalEmpty message="No users found." />
      ) : (
        <div className="overflow-x-auto">
          <SZTable headers={["Name", "Email", "Phone", "Role"]}>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2 border">{u.full_name ?? "-"}</td>
                <td className="p-2 border">{u.email ?? "-"}</td>
                <td className="p-2 border">{u.phone ?? "-"}</td>
                <td className="p-2 border">{u.role ?? "-"}</td>
              </tr>
            ))}
          </SZTable>
        </div>
      )}
    </div>
  );
};

export default SalesDirectoryPage;
