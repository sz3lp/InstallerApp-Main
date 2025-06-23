import React, { useState } from "react";
import { SZButton } from "../../../components/ui/SZButton";
import { SZTable } from "../../../components/ui/SZTable";
import MaterialForm from "../../../components/forms/MaterialForm";
import useMaterials, { Material } from "../../../lib/hooks/useMaterials";

const emptyMaterial: Omit<Material, "id"> = {
  name: "",
  sku: "",
  category: "",
  base_cost: 0,
  default_sale_price: 0,
  default_pay_rate: 0,
  active: true,
};

const MaterialListPage: React.FC = () => {
  const { materials, loading, createMaterial, updateMaterial, deactivateMaterial } = useMaterials();
  const [current, setCurrent] = useState<Material | null>(null);

  const save = async (data: Omit<Material, "id">, id?: string) => {
    if (id) await updateMaterial(id, data);
    else await createMaterial(data);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Material Types</h1>
      <SZButton size="sm" onClick={() => setCurrent({ id: "new", ...emptyMaterial })}>
        New Material
      </SZButton>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <SZTable
          headers={[
            "Name",
            "SKU",
            "Category",
            "Base Cost",
            "Sale Price",
            "Pay Rate",
            "Active",
            "",
          ]}
        >
          {materials.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="p-2 border">{m.name}</td>
              <td className="p-2 border">{m.sku || "-"}</td>
              <td className="p-2 border">{m.category || "-"}</td>
              <td className="p-2 border text-right">{m.base_cost ?? "-"}</td>
              <td className="p-2 border text-right">{m.default_sale_price ?? "-"}</td>
              <td className="p-2 border text-right">{m.default_pay_rate ?? "-"}</td>
              <td className="p-2 border text-center">{m.active === false ? "No" : "Yes"}</td>
              <td className="p-2 border space-x-2">
                <SZButton size="xs" onClick={() => setCurrent(m)}>Edit</SZButton>
                {m.active !== false && (
                  <SZButton
                    size="xs"
                    variant="secondary"
                    onClick={() => deactivateMaterial(m.id)}
                  >
                    Deactivate
                  </SZButton>
                )}
              </td>
            </tr>
          ))}
        </SZTable>
      )}
      {current && (
        <MaterialForm
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

export default MaterialListPage;
