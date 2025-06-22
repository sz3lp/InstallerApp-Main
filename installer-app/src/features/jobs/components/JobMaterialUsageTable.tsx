import React from "react";
import { JobZone } from "../jobService";

export interface JobMaterialUsageTableProps {
  zones: JobZone[];
}

export default function JobMaterialUsageTable({ zones }: JobMaterialUsageTableProps) {
  const componentMap = new Map<string, number>();
  zones.forEach((z) => {
    z.components.forEach((c) => {
      const qty = componentMap.get(c.name) ?? 0;
      componentMap.set(c.name, qty + c.quantity);
    });
  });

  const rateMap: Record<string, number> = {
    Controller: 50,
    "PIR Sensor": 25,
    "DHT22 Sensor": 20,
    "Relay Block": 30,
  };

  const payMap = new Map<string, number>();
  zones.forEach((z) => {
    z.components.forEach((c) => {
      if (c.reusable) return;
      const qty = payMap.get(c.name) ?? 0;
      payMap.set(c.name, qty + c.quantity);
    });
  });

  const calculated = [...payMap.entries()].map(([name, quantity]) => {
    const rate = rateMap[name] ?? 0;
    return { name, quantity, rate, total: quantity * rate };
  });

  const totalPay = calculated.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Labor Bill</h2>
      <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
        {calculated.map((item) => (
          <li key={item.name}>
            {item.quantity}x {item.name} @ ${item.rate} = ${item.total}
          </li>
        ))}
      </ul>
      <p className="mt-4 font-bold text-md">Total Installer Pay: ${totalPay}</p>
    </div>
  );
}
