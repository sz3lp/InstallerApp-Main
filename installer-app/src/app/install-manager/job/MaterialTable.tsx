import React, { useState, useEffect } from "react";
import supabase from "../../../lib/supabaseClient";

interface Material {
  id: string;
  name: string;
  base_cost: number;
  default_pay_rate: number;
  default_sale_price: number;
}

export interface MaterialRow {
  material_id: string;
  quantity: number;
  unit_material_cost: number;
  unit_labor_cost: number;
  default_sale_price: number;
  sale_price: number;
  manual_sale_price?: boolean;
  install_location: string;
}

interface Props {
  onChange: (rows: MaterialRow[]) => void;
}

const blankRow: MaterialRow = {
  material_id: "",
  quantity: 1,
  unit_material_cost: 0,
  unit_labor_cost: 0,
  default_sale_price: 0,
  sale_price: 0,
  manual_sale_price: false,
  install_location: "",
};

const MaterialTable: React.FC<Props> = ({ onChange }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [rows, setRows] = useState<MaterialRow[]>([ { ...blankRow } ]);

  useEffect(() => {
    async function loadMaterials() {
      const { data } = await supabase
        .from<Material>("materials")
        .select("id, name, base_cost, default_pay_rate, default_sale_price");
      setMaterials(data ?? []);
    }
    loadMaterials();
  }, []);

  useEffect(() => {
    onChange(rows);
  }, [rows, onChange]);

  const materialMap = Object.fromEntries(materials.map((m) => [m.id, m]));

  const updateRows = (next: MaterialRow[]) => {
    setRows(next);
  };

  const handleRowChange = (
    index: number,
    key: keyof MaterialRow,
    value: string | number | boolean
  ) => {
    updateRows(
      rows.map((r, i) =>
        i === index ? { ...r, [key]: value } : r
      )
    );
  };

  const handleMaterialSelect = (index: number, id: string) => {
    const mat = materialMap[id];
    updateRows(
      rows.map((r, i) => {
        if (i !== index) return r;
        const quantity = r.quantity || 1;
        const sale = r.manual_sale_price
          ? r.sale_price
          : (mat?.default_sale_price ?? 0) * quantity;
        return {
          ...r,
          material_id: id,
          unit_material_cost: mat?.base_cost ?? 0,
          unit_labor_cost: mat?.default_pay_rate ?? 0,
          default_sale_price: mat?.default_sale_price ?? 0,
          sale_price: sale,
        };
      })
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    updateRows(
      rows.map((r, i) => {
        if (i !== index) return r;
        const quantity = qty < 1 ? 1 : qty;
        const sale = r.manual_sale_price
          ? r.sale_price
          : r.default_sale_price * quantity;
        return { ...r, quantity, sale_price: sale };
      })
    );
  };

  const handleSalePriceChange = (index: number, value: number) => {
    updateRows(
      rows.map((r, i) =>
        i === index
          ? { ...r, sale_price: value, manual_sale_price: true }
          : r
      )
    );
  };

  const addRow = () => updateRows([...rows, { ...blankRow }]);

  const removeRow = (idx: number) => updateRows(rows.filter((_, i) => i !== idx));

  const getTotal = (row: MaterialRow) => {
    return row.quantity * (row.unit_material_cost + row.unit_labor_cost);
  };

  return (
    <div className="space-y-2">
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Qty</th>
            <th className="p-2 border">Material Cost</th>
            <th className="p-2 border">Labor Cost</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Sale Price</th>
            <th className="p-2 border">Install Location</th>
            <th className="p-2 border"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const total = getTotal(r);
            return (
              <tr key={idx} className="border-t">
                <td className="p-2 border">
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={r.material_id}
                    onChange={(e) => handleMaterialSelect(idx, e.target.value)}
                  >
                    <option value="">Select</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-16"
                    value={r.quantity}
                    min={1}
                    onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                  />
                </td>
                <td className="p-2 border text-right">{r.unit_material_cost}</td>
                <td className="p-2 border text-right">{r.unit_labor_cost}</td>
                <td className="p-2 border text-right">{total}</td>
                <td className="p-2 border">
                  <input
                    type="number"
                    className="border rounded px-2 py-1 w-24"
                    value={r.sale_price}
                    onChange={(e) => handleSalePriceChange(idx, Number(e.target.value))}
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    className="border rounded px-2 py-1"
                    value={r.install_location}
                    onChange={(e) => handleRowChange(idx, "install_location", e.target.value)}
                  />
                </td>
                <td className="p-2 border text-center">
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => removeRow(idx)}
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        type="button"
        className="mt-2 text-sm px-3 py-1 border rounded"
        onClick={addRow}
      >
        Add Material
      </button>
    </div>
  );
};

export default MaterialTable;
