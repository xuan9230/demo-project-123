import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildFallback,
  buildPrompt,
  computeInputHash,
  validateOutput,
  type LuxuryVehicleInput,
} from "../utils/openai";

// ─── Mocks (hoisted so they're available before module imports) ───────────────

const { fromMock, generateAIMock, envMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  generateAIMock: vi.fn(),
  envMock: {
    luxuryPromoAiEnabled: true,
    maxAiGenerationsPerRequest: 5,
    openaiModel: "gpt-4.1-mini",
    openaiApiKey: "sk-test",
  },
}));

vi.mock("../config/supabase", () => ({
  supabase: { from: fromMock },
}));

vi.mock("../utils/openai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/openai")>();
  return { ...actual, generatePromoWithAI: generateAIMock };
});

vi.mock("../config/env", () => ({ env: envMock }));

import { enrichWithPromos } from "../utils/luxury-promo";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeListing = (overrides: Partial<LuxuryVehicleInput> = {}): LuxuryVehicleInput => ({
  id: "listing-1",
  year: 2022,
  make: "Mercedes-Benz",
  model: "S500",
  variant: "AMG",
  mileage: 19000,
  price: 168000,
  region: "Auckland",
  ...overrides,
});

/** Build a chainable Supabase query mock that resolves to { data, error } */
const makeQueryMock = (data: unknown, error: unknown = null) => {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "in", "upsert"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  (chain as { then: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }> }).then = (
    resolve: (value: { data: unknown; error: unknown }) => unknown
  ) => Promise.resolve(resolve({ data, error }));
  return chain;
};

// ─── Pure function tests ──────────────────────────────────────────────────────

describe("buildFallback", () => {
  it("produces the expected template string", () => {
    const listing = makeListing({ variant: null });
    const result = buildFallback(listing);
    expect(result).toContain("2022 Mercedes-Benz S500");
    expect(result).toContain("$168,000");
    expect(result).toContain("19,000 km");
    expect(result).toContain("Auckland");
  });

  it("includes variant when present", () => {
    const result = buildFallback(makeListing());
    expect(result).toContain("S500 AMG");
  });

  it("omits variant when null", () => {
    const result = buildFallback(makeListing({ variant: null }));
    expect(result).not.toContain("AMG");
  });
});

describe("validateOutput", () => {
  const good =
    "Step into a world of refined luxury with this exceptional Mercedes-Benz S500 AMG, offering commanding performance and exquisite comfort for the discerning Auckland driver.";

  it("accepts text in the 20-45 word range", () => {
    expect(validateOutput(good)).toBe(true);
  });

  it("rejects text shorter than 20 words", () => {
    expect(validateOutput("Short text here.")).toBe(false);
  });

  it("rejects text longer than 45 words", () => {
    const long = Array.from({ length: 46 }, (_, i) => `word${i}`).join(" ");
    expect(validateOutput(long)).toBe(false);
  });

  it("rejects text containing banned term 'accident'", () => {
    const withBanned =
      "No accident history on this pristine luxury sedan, offering an exceptional driving experience for discerning motorists across New Zealand.";
    expect(validateOutput(withBanned)).toBe(false);
  });

  it("rejects text containing banned term 'warranty'", () => {
    const withBanned =
      "This stunning vehicle comes with full warranty coverage and represents outstanding value for the luxury segment enthusiast seeking refinement.";
    expect(validateOutput(withBanned)).toBe(false);
  });

  it("rejects text containing banned term 'financing'", () => {
    const withBanned =
      "Flexible financing options available on this exceptional premium sedan offering commanding road presence and sophisticated interior refinement throughout.";
    expect(validateOutput(withBanned)).toBe(false);
  });
});

describe("computeInputHash", () => {
  it("returns the same hash for identical inputs", () => {
    const a = computeInputHash(makeListing());
    const b = computeInputHash(makeListing());
    expect(a).toBe(b);
  });

  it("returns different hashes when price changes", () => {
    const a = computeInputHash(makeListing({ price: 168000 }));
    const b = computeInputHash(makeListing({ price: 170000 }));
    expect(a).not.toBe(b);
  });

  it("returns different hashes when mileage changes", () => {
    const a = computeInputHash(makeListing({ mileage: 19000 }));
    const b = computeInputHash(makeListing({ mileage: 20000 }));
    expect(a).not.toBe(b);
  });
});

describe("buildPrompt", () => {
  it("includes vehicle details in the prompt", () => {
    const prompt = buildPrompt(makeListing());
    expect(prompt).toContain("2022");
    expect(prompt).toContain("Mercedes-Benz");
    expect(prompt).toContain("S500");
    expect(prompt).toContain("AMG");
    expect(prompt).toContain("Auckland");
  });

  it("does not include variant line when variant is null", () => {
    const prompt = buildPrompt(makeListing({ variant: null }));
    expect(prompt).not.toContain("Variant:");
  });
});

// ─── enrichWithPromos tests ───────────────────────────────────────────────────

describe("enrichWithPromos", () => {
  beforeEach(() => {
    fromMock.mockReset();
    generateAIMock.mockReset();
    envMock.luxuryPromoAiEnabled = true;
    envMock.maxAiGenerationsPerRequest = 5;
  });

  it("returns cached AI promo on cache hit with valid hash and fresh timestamp", async () => {
    const listing = makeListing();
    const hash = computeInputHash(listing);
    const cachedRow = {
      listing_id: listing.id,
      description: "Cached AI description for this luxury vehicle.",
      input_hash: hash,
      generated_at: new Date().toISOString(),
      model: "gpt-4.1-mini",
    };

    fromMock.mockReturnValue(makeQueryMock([cachedRow]));

    const result = await enrichWithPromos([listing]);
    const promo = result.get(listing.id)!;

    expect(promo.source).toBe("ai");
    expect(promo.description).toBe(cachedRow.description);
    expect(promo.generatedAt).toBe(cachedRow.generated_at);
    expect(generateAIMock).not.toHaveBeenCalled();
  });

  it("generates AI promo and upserts on cache miss", async () => {
    const listing = makeListing();
    const aiText =
      "Discover refined luxury and commanding performance in this low-kilometre Mercedes-Benz S500 AMG, a prestigious choice for discerning Auckland drivers.";

    // First call: loadCachedPromos returns empty; second call: upsertPromo
    fromMock
      .mockReturnValueOnce(makeQueryMock([]))
      .mockReturnValueOnce(makeQueryMock(null));

    generateAIMock.mockResolvedValueOnce(aiText);

    const result = await enrichWithPromos([listing]);
    const promo = result.get(listing.id)!;

    expect(promo.source).toBe("ai");
    expect(promo.description).toBe(aiText);
    expect(promo.generatedAt).toBeTruthy();
    expect(generateAIMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: listing.id })
    );
  });

  it("falls back to template when AI returns null", async () => {
    const listing = makeListing();

    fromMock.mockReturnValue(makeQueryMock([]));
    generateAIMock.mockResolvedValueOnce(null);

    const result = await enrichWithPromos([listing]);
    const promo = result.get(listing.id)!;

    expect(promo.source).toBe("fallback");
    expect(promo.generatedAt).toBeNull();
    expect(promo.description).toContain("2022 Mercedes-Benz S500");
  });

  it("caps AI generation at maxAiGenerationsPerRequest; excess items get fallback", async () => {
    envMock.maxAiGenerationsPerRequest = 2;

    const listings = [
      makeListing({ id: "a" }),
      makeListing({ id: "b" }),
      makeListing({ id: "c" }),
    ];

    fromMock.mockReturnValue(makeQueryMock([]));

    const aiText =
      "Experience the pinnacle of automotive luxury in this premium Mercedes-Benz S500 AMG, offering refined performance for distinguished Auckland motorists.";
    generateAIMock.mockResolvedValue(aiText);

    const result = await enrichWithPromos(listings);

    // Only 2 AI calls should be made (cap = 2)
    expect(generateAIMock).toHaveBeenCalledTimes(2);

    const promoC = result.get("c")!;
    expect(promoC.source).toBe("fallback");
    expect(promoC.generatedAt).toBeNull();
  });

  it("skips AI generation entirely when feature flag is disabled", async () => {
    envMock.luxuryPromoAiEnabled = false;

    const listing = makeListing();
    fromMock.mockReturnValue(makeQueryMock([]));

    const result = await enrichWithPromos([listing]);
    const promo = result.get(listing.id)!;

    expect(generateAIMock).not.toHaveBeenCalled();
    expect(promo.source).toBe("fallback");
    expect(promo.generatedAt).toBeNull();
  });

  it("regenerates when input_hash differs (price changed)", async () => {
    const listing = makeListing({ price: 175000 });
    const staleHash = computeInputHash(makeListing({ price: 168000 })); // old price
    const staleRow = {
      listing_id: listing.id,
      description: "Old promo text.",
      input_hash: staleHash,
      generated_at: new Date().toISOString(),
      model: "gpt-4.1-mini",
    };

    fromMock
      .mockReturnValueOnce(makeQueryMock([staleRow]))
      .mockReturnValueOnce(makeQueryMock(null));

    const aiText =
      "Commanding road presence meets executive comfort in this impeccably maintained Mercedes-Benz S500 AMG, perfectly priced for the discerning Auckland buyer.";
    generateAIMock.mockResolvedValueOnce(aiText);

    const result = await enrichWithPromos([listing]);
    const promo = result.get(listing.id)!;

    expect(promo.source).toBe("ai");
    expect(promo.description).toBe(aiText);
    expect(generateAIMock).toHaveBeenCalled();
  });
});
