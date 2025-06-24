import supabase from "../supabaseClient";

export interface PricingRule {
  id: string;
  type: "markup" | "tier" | "override";
  value?: number | null;
  margin?: number | null;
  tier?: number | null;
  client_id?: string | null;
  material_type_id?: string | null;
}

let cachedRules: PricingRule[] | null = null;

export async function fetchPricingRules(): Promise<PricingRule[]> {
  if (cachedRules) return cachedRules;
  const { data, error } = await supabase.from("pricing_rules").select("*");
  if (error) {
    console.error("Failed to fetch pricing rules", error);
    cachedRules = [];
    return [];
  }
  cachedRules = (data ?? []) as PricingRule[];
  return cachedRules;
}

export interface PricingContext {
  clientId?: string | null;
  materialTypeId?: string | null;
  quantity?: number;
}

export async function calculateFinalPrice(
  baseCost: number,
  context: PricingContext = {},
): Promise<number> {
  const rules = await fetchPricingRules();
  let cost = baseCost;

  const override = rules.find(
    (r) =>
      r.type === "override" &&
      (r.client_id === context.clientId || !r.client_id) &&
      (r.material_type_id === context.materialTypeId || !r.material_type_id),
  );
  if (override && override.value != null) {
    return override.value;
  }

  const applicableTier = rules
    .filter(
      (r) =>
        r.type === "tier" &&
        (r.material_type_id === context.materialTypeId || !r.material_type_id),
    )
    .filter((r) =>
      context.quantity && r.tier != null ? context.quantity >= r.tier : false,
    )
    .sort((a, b) => (b.tier ?? 0) - (a.tier ?? 0))[0];

  if (applicableTier && applicableTier.margin != null) {
    cost = cost * (1 + applicableTier.margin);
  }

  const markup = rules.find(
    (r) =>
      r.type === "markup" &&
      (r.material_type_id === context.materialTypeId || !r.material_type_id),
  );
  if (markup && markup.value != null) {
    cost = cost * (1 + markup.value);
  }

  return Math.round(cost * 100) / 100;
}

export default {
  fetchPricingRules,
  calculateFinalPrice,
};
