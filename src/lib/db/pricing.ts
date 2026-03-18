import type { SupabaseClient } from "@supabase/supabase-js"
import type { PricingPackage, PricingAddOn } from "@/types"

// ─── Type mapping ─────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): PricingPackage {
  const addOns = typeof row.add_ons === "string"
    ? JSON.parse(row.add_ons)
    : (row.add_ons as PricingAddOn[]) ?? []

  const includes = Array.isArray(row.includes)
    ? (row.includes as string[])
    : typeof row.includes === "string"
    ? JSON.parse(row.includes)
    : []

  return {
    id:          row.id as string,
    name:        row.name as string,
    category:    row.category as string,
    description: row.description as string,
    basePrice:   row.base_price as number,
    includes,
    addOns,
    popular:     row.popular as boolean,
  }
}

function toRow(pkg: Partial<PricingPackage>, userId: string) {
  return {
    user_id:     userId,
    name:        pkg.name,
    category:    pkg.category,
    description: pkg.description,
    base_price:  pkg.basePrice,
    includes:    pkg.includes ?? [],
    add_ons:     JSON.stringify(pkg.addOns ?? []),
    popular:     pkg.popular ?? false,
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchPackages(
  supabase: SupabaseClient,
  userId: string
): Promise<PricingPackage[]> {
  const { data, error } = await supabase
    .from("pricing_packages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(fromRow)
}

export async function insertPackage(
  supabase: SupabaseClient,
  pkg: Partial<PricingPackage>,
  userId: string
): Promise<PricingPackage> {
  const { data, error } = await supabase
    .from("pricing_packages")
    .insert(toRow(pkg, userId))
    .select()
    .single()

  if (error) throw error
  return fromRow(data)
}

export async function updatePackage(
  supabase: SupabaseClient,
  id: string,
  pkg: Partial<PricingPackage>
): Promise<PricingPackage> {
  const { data, error } = await supabase
    .from("pricing_packages")
    .update({
      name:        pkg.name,
      category:    pkg.category,
      description: pkg.description,
      base_price:  pkg.basePrice,
      includes:    pkg.includes ?? [],
      add_ons:     JSON.stringify(pkg.addOns ?? []),
      popular:     pkg.popular ?? false,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return fromRow(data)
}

export async function deletePackage(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("pricing_packages")
    .delete()
    .eq("id", id)

  if (error) throw error
}
