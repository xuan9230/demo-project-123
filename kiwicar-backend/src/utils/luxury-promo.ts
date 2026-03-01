import { supabase } from "../config/supabase";
import { env } from "../config/env";
import {
  buildFallback,
  computeInputHash,
  generatePromoWithAI,
  type LuxuryVehicleInput,
} from "./openai";

export interface PromoResult {
  description: string;
  source: "ai" | "fallback";
  generatedAt: string | null;
}

type CachedPromo = {
  description: string;
  input_hash: string;
  generated_at: string;
  model: string;
};

const CACHE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const GENERATION_CONCURRENCY = 3;

const isCacheValid = (cached: CachedPromo, currentHash: string): boolean => {
  if (cached.input_hash !== currentHash) return false;
  const age = Date.now() - new Date(cached.generated_at).getTime();
  return age < CACHE_MAX_AGE_MS;
};

export const loadCachedPromos = async (
  listingIds: string[]
): Promise<Map<string, CachedPromo>> => {
  if (listingIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("luxury_vehicle_promotions")
    .select("listing_id,description,input_hash,generated_at,model")
    .in("listing_id", listingIds);

  if (error || !data) return new Map();

  return new Map(data.map((row) => [row.listing_id as string, row as CachedPromo]));
};

export const upsertPromo = async (
  listingId: string,
  description: string,
  inputHash: string,
  model: string
): Promise<void> => {
  const now = new Date().toISOString();
  await supabase.from("luxury_vehicle_promotions").upsert(
    {
      listing_id: listingId,
      description,
      input_hash: inputHash,
      model,
      generated_at: now,
      updated_at: now,
    },
    { onConflict: "listing_id" }
  );
};

interface PromoMetrics {
  cacheHits: number;
  cacheMisses: number;
  aiSuccesses: number;
  aiFailures: number;
  fallbacks: number;
  aiLatencyMs: number[];
}

const generateForListing = async (
  input: LuxuryVehicleInput,
  metrics: PromoMetrics
): Promise<{ listingId: string; promo: PromoResult }> => {
  const hash = computeInputHash(input);
  const start = Date.now();

  const description = await generatePromoWithAI(input);
  metrics.aiLatencyMs.push(Date.now() - start);

  if (description) {
    metrics.aiSuccesses++;
    await upsertPromo(input.id, description, hash, env.openaiModel);
    return {
      listingId: input.id,
      promo: { description, source: "ai", generatedAt: new Date().toISOString() },
    };
  }

  metrics.aiFailures++;
  metrics.fallbacks++;
  return {
    listingId: input.id,
    promo: { description: buildFallback(input), source: "fallback", generatedAt: null },
  };
};

export const enrichWithPromos = async (
  listings: LuxuryVehicleInput[]
): Promise<Map<string, PromoResult>> => {
  const metrics: PromoMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    aiSuccesses: 0,
    aiFailures: 0,
    fallbacks: 0,
    aiLatencyMs: [],
  };

  const cachedPromos = await loadCachedPromos(listings.map((l) => l.id));
  const result = new Map<string, PromoResult>();
  const toGenerate: LuxuryVehicleInput[] = [];

  for (const listing of listings) {
    const hash = computeInputHash(listing);
    const cached = cachedPromos.get(listing.id);

    if (cached && isCacheValid(cached, hash)) {
      metrics.cacheHits++;
      result.set(listing.id, {
        description: cached.description,
        source: "ai",
        generatedAt: cached.generated_at,
      });
    } else {
      metrics.cacheMisses++;
      toGenerate.push(listing);
    }
  }

  const aiEnabled = env.luxuryPromoAiEnabled;
  const cap = env.maxAiGenerationsPerRequest;
  const toActuallyGenerate = aiEnabled ? toGenerate.slice(0, cap) : [];
  const toFallback = aiEnabled ? toGenerate.slice(cap) : toGenerate;

  for (const listing of toFallback) {
    metrics.fallbacks++;
    result.set(listing.id, {
      description: buildFallback(listing),
      source: "fallback",
      generatedAt: null,
    });
  }

  for (let i = 0; i < toActuallyGenerate.length; i += GENERATION_CONCURRENCY) {
    const batch = toActuallyGenerate.slice(i, i + GENERATION_CONCURRENCY);
    const results = await Promise.all(
      batch.map((listing) => generateForListing(listing, metrics))
    );
    for (const { listingId, promo } of results) {
      result.set(listingId, promo);
    }
  }

  const avgLatency =
    metrics.aiLatencyMs.length > 0
      ? Math.round(
          metrics.aiLatencyMs.reduce((a, b) => a + b, 0) / metrics.aiLatencyMs.length
        )
      : 0;

  console.log(
    JSON.stringify({
      event: "luxury_promo_metrics",
      luxury_promo_cache_hit_count: metrics.cacheHits,
      luxury_promo_cache_miss_count: metrics.cacheMisses,
      luxury_promo_ai_success_count: metrics.aiSuccesses,
      luxury_promo_ai_failure_count: metrics.aiFailures,
      luxury_promo_fallback_count: metrics.fallbacks,
      luxury_promo_ai_latency_ms: avgLatency,
    })
  );

  return result;
};
