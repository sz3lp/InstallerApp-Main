import React, { useEffect, useRef, useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import useClients from "../../lib/hooks/useClients";
import supabase from "../../lib/supabaseClient";
import { calculateFinalPrice } from "../../lib/pricing/PricingRulesEngine";
import { SZInput } from "../../components/ui/SZInput";
import { SZButton } from "../../components/ui/SZButton";
import uploadSignature from "../../lib/uploadSignature";

interface Template {
  id: string;
  name: string;
  default_items: { description: string; qty: number; unit_price: number }[];
}

interface LineItem {
  description: string;
  quantity: number;
  base_price: number;
  unit_price: number;
}

export default function QuoteBuilderV2() {
  const { role, user } = useAuth();
  const [clients] = useClients();
  const [clientId, setClientId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);
  const [tax, setTax] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signedBy, setSignedBy] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    supabase
      .from("quote_templates")
      .select("id, name, default_items")
      .then(({ data }) => setTemplates((data as Template[]) || []));
  }, []);

  useEffect(() => {
    if (!templateId) return;
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      const mapped = tmpl.default_items.map((i) => ({
        description: i.description,
        quantity: i.qty,
        base_price: i.unit_price,
        unit_price: i.unit_price,
      }));
      setItems(mapped);
      mapped.forEach((_, idx) => {
        applyPricing(idx, mapped[idx].base_price);
      });
    }
  }, [templateId, templates]);

  const applyPricing = async (idx: number, base = items[idx].base_price) => {
    const price = await calculateFinalPrice(base, {
      clientId,
      quantity: items[idx].quantity,
    });
    setItems((itms) =>
      itms.map((it, i) => (i === idx ? { ...it, unit_price: price } : it)),
    );
  };

  const updateItem = (idx: number, key: keyof LineItem, value: any) => {
    setItems((list) =>
      list.map((it, i) => (i === idx ? { ...it, [key]: value } : it)),
    );
    if (key === "base_price" || key === "quantity") applyPricing(idx, value);
  };

  const addItem = () =>
    setItems((i) => [
      ...i,
      { description: "", quantity: 1, base_price: 0, unit_price: 0 },
    ]);
  const removeItem = (idx: number) =>
    setItems((i) => i.filter((_, n) => n !== idx));

  const total = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const totalWithTax = total + total * (tax / 100);

  const saveQuote = async (send = false) => {
    const { data: quote } = await supabase
      .from("quotes")
      .insert({
        client_id: clientId,
        status: send ? "sent" : "draft",
        created_by: user?.id,
        total_price: totalWithTax,
      })
      .select()
      .single();
    if (!quote) return;

    const rows = items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total: i.quantity * i.unit_price,
      quote_id: quote.id,
    }));
    if (rows.length) await supabase.from("quote_items").insert(rows);

    if (hasSignature && canvasRef.current) {
      const blob: Blob | null = await new Promise((res) =>
        canvasRef.current?.toBlob((b) => res(b), "image/png"),
      );
      if (blob) {
        const file = new File([blob], `quote_signature_${quote.id}.png`, {
          type: "image/png",
        });
        const url = await uploadSignature(quote.id, file);
        if (url) {
          await supabase
            .from("quotes")
            .update({ signature_url: url, signed_by: signedBy })
            .eq("id", quote.id);
        }
      }
    }
    alert(`Quote ${send ? "sent" : "saved"}!`);
  };

  if (role !== "Sales" && role !== "Admin")
    return <div className="p-4">Access denied</div>;

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Create Quote</h1>
      <div>
        <label className="block text-sm font-medium" htmlFor="client">
          Client
        </label>
        <select
          id="client"
          className="border p-2 rounded w-full"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          <option value="">Select</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="template">
          Template
        </label>
        <select
          id="template"
          className="border p-2 rounded w-full"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Select</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 items-end">
          <SZInput
            id={`desc_${idx}`}
            label="Description"
            value={it.description}
            onChange={(v) => updateItem(idx, "description", v)}
          />
          <SZInput
            id={`qty_${idx}`}
            label="Qty"
            type="number"
            value={String(it.quantity)}
            onChange={(v) => updateItem(idx, "quantity", parseInt(v))}
          />
          <SZInput
            id={`base_${idx}`}
            label="Base Price"
            type="number"
            value={String(it.base_price)}
            onChange={(v) => updateItem(idx, "base_price", parseFloat(v))}
          />
          <div className="pt-6">${it.unit_price.toFixed(2)}</div>
          <SZButton
            size="sm"
            variant="destructive"
            onClick={() => removeItem(idx)}
          >
            Remove
          </SZButton>
        </div>
      ))}
      <SZButton size="sm" variant="secondary" onClick={addItem}>
        Add Line
      </SZButton>
      <div>
        <SZInput
          id="tax"
          label="Tax %"
          type="number"
          value={String(tax)}
          onChange={(v) => setTax(parseFloat(v) || 0)}
        />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1">Client Signature</p>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          onMouseDown={(e) => {
            setDrawing(true);
            setHasSignature(true);
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
              ctx.strokeStyle = "#000";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            }
          }}
          onMouseMove={(e) => {
            if (!drawing) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
              ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
              ctx.stroke();
            }
          }}
          onMouseUp={() => setDrawing(false)}
          onMouseLeave={() => setDrawing(false)}
          className="border w-full"
        />
        <button
          type="button"
          className="text-xs text-gray-500 mt-1"
          onClick={() => {
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && canvasRef.current) {
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height,
              );
            }
            setHasSignature(false);
          }}
        >
          Clear
        </button>
        <div className="mt-2">
          <label
            htmlFor="signed_by"
            className="block text-sm font-semibold mb-1"
          >
            Signed By
          </label>
          <input
            id="signed_by"
            type="text"
            value={signedBy}
            onChange={(e) => setSignedBy(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>
      <div className="font-semibold">Total: ${totalWithTax.toFixed(2)}</div>
      <div className="flex gap-2">
        <SZButton onClick={() => saveQuote(false)}>Save Draft</SZButton>
        <SZButton onClick={() => saveQuote(true)}>Send Quote</SZButton>
      </div>
    </div>
  );
}
