import React, { useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import { GlobalLoading, GlobalError } from "../../../components/global-states";
import useMaterialTypes, {
  MaterialType,
} from "../../../lib/hooks/useMaterialTypes";
import MaterialTypeForm from "../../../components/forms/MaterialTypeForm";

const emptyMaterial: Omit<MaterialType, "id" | "created_at"> = {
  name: "",
  unit_of_measure: "",
  default_cost: 0,
  retail_price: 0,
};

const MaterialTypesPage: React.FC = () => {
  const {
    materials,
    loading,
    error,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useMaterialTypes();
  const [current, setCurrent] = useState<MaterialType | null>(null);

  const save = async (
    data: Omit<MaterialType, "id" | "created_at">,
    id?: string,
  ) => {
    const normalized = data.name.trim().toLowerCase();
    const exists = materials.some(
      (m) => m.name.trim().toLowerCase() === normalized && m.id !== id,
    );
    if (exists) throw new Error("Name already exists");
    if (id) await updateMaterial(id, data);
    else await createMaterial(data);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Material Types</h1>
      <SZButton
        size="sm"
        onClick={() =>
          setCurrent({ id: "new", created_at: "", ...emptyMaterial })
        }
      >
        New Material
      </SZButton>
      {loading ? (
        <GlobalLoading />
      ) : error ? (
        <GlobalError message={error} onRetry={() => {}} />
      ) : (
        <SZTable
          headers={[
            "Name",
            "Unit",
            "Default Cost",
            "Retail Price",
            "Created At",
            "",
          ]}
        >
          {materials.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2 border">{m.name}</td>
              <td className="p-2 border">{m.unit_of_measure}</td>
              <td className="p-2 border text-right">{m.default_cost ?? "-"}</td>
              <td className="p-2 border text-right">{m.retail_price ?? "-"}</td>
              <td className="p-2 border text-sm text-gray-500">
                {new Date(m.created_at).toLocaleDateString()}
              </td>
              <td className="p-2 border space-x-2">
                <SZButton size="xs" onClick={() => setCurrent(m)}>
                  Edit
                </SZButton>
                <SZButton
                  size="xs"
                  variant="secondary"
                  onClick={() => deleteMaterial(m.id)}
                >
                  Delete
                </SZButton>
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      {current && (
        <MaterialTypeForm
          material={current.id === "new" ? undefined : current}
          onSave={async (data) => {
            await save(data, current.id === "new" ? undefined : current.id);
          }}
          onClose={() => setCurrent(null)}
        />
      )}
    </div>
  );
};

export default MaterialTypesPage;
