# PRD: AI Promotion Copy for Luxury Vehicle Listing API

**Document Version:** 1.0  
**Created:** February 12, 2026  
**Status:** Draft (Ready for Implementation)  
**Product Area:** Backend API (`kiwicar-backend`)  
**Related Endpoint:** `GET /api/v1/luxury-vehicle`

---

## 1. Problem Statement

`GET /luxury-vehicle` currently returns premium vehicle cards (title, price, year, mileage, region, image), but no persuasive copy that helps sell each vehicle.

We need to generate a short promotional message per luxury vehicle using OpenAI so the frontend can present richer, more premium listing cards.

---

## 2. Goals

1. Add a promotional description for each vehicle returned by `GET /luxury-vehicle`.
2. Use OpenAI API to generate the promotion copy.
3. Keep endpoint response time predictable with cache-first behavior.
4. Avoid hallucinations and unsafe claims in generated copy.
5. Keep compatibility with current response wrapper format (`successResponse`).

---

## 3. Non-Goals (MVP)

1. No background worker queue or cron jobs.
2. No multilingual generation in MVP (English only).
3. No admin UI for editing generated copy.
4. No image-based vision prompting in MVP.

---

## 4. Current State (As-Is)

- Route: `src/routes/luxury-vehicle.ts`
- Data source: Supabase `listings` + `listing_images`
- Filter: `status = active`, `price > 100000`
- Sort: `price DESC`
- Result limit: 200
- No Zod validation on query params
- No AI generation in this route
- `OPENAI_API_KEY` is already present in env config (`src/config/env.ts`)

---

## 5. Proposed Solution (MVP)

### 5.1 High-Level Flow

1. Fetch luxury listings from Supabase (existing behavior).
2. Load cached AI promotion copy for all returned listing IDs.
3. Return promo text for every listing:
   - cache hit: use AI text
   - cache miss: use deterministic fallback template immediately
4. For cache misses, generate AI copy for up to `MAX_AI_GENERATIONS_PER_REQUEST` items in-request (bounded concurrency), then upsert into cache table.
5. Next request benefits from cache hits.

### 5.2 Why This Design

- Guarantees every listing has a promotion field immediately.
- Prevents worst-case latency/cost when up to 200 listings are returned.
- Works within current MVP constraint (no background job infra).

---

## 6. API Contract Changes

### 6.1 Endpoint

- Keep endpoint path: `GET /api/v1/luxury-vehicle`
- Keep auth: public (same as today)

### 6.2 Response Change

Add `promo` object on each item.

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "2022 Mercedes-Benz S500 AMG",
      "price": 168000,
      "year": 2022,
      "mileage": 19000,
      "region": "Auckland",
      "coverImage": "https://...",
      "createdAt": "2026-02-10T10:00:00.000Z",
      "promo": {
        "description": "Experience flagship comfort and confident performance in this low-kilometre S500, ideal for drivers wanting executive luxury without compromise.",
        "source": "ai",
        "generatedAt": "2026-02-12T06:10:00.000Z"
      }
    }
  ]
}
```

### 6.3 Promo Field Rules

- `promo.description`: required string, 20-45 words, plain text
- `promo.source`: `"ai" | "fallback"`
- `promo.generatedAt`: ISO timestamp when source is `ai`; `null` for fallback

---

## 7. AI Generation Requirements

### 7.1 Model

- Default: `gpt-4.1-mini` (cost/latency balanced)
- Configurable via env: `OPENAI_MODEL` (optional)

### 7.2 Prompt Inputs

Use only trusted listing fields:
- year, make, model, variant
- mileage
- price
- region

Do not include seller-provided free-form description in MVP.

### 7.3 Output Constraints

Prompt must enforce:
- 1-2 sentences
- 20-45 words
- professional and premium tone
- no emojis
- no unverifiable claims (service history, accidents, warranty, ownership count, mechanical condition)
- no financing promises or legal guarantees

### 7.4 Timeout and Reliability

- Per-call timeout: 2 seconds
- If timeout/error occurs: use fallback template
- Do not fail entire endpoint when AI fails

---

## 8. Caching & Persistence

### 8.1 New Table (Supabase)

`luxury_vehicle_promotions`

| Column | Type | Notes |
|---|---|---|
| `listing_id` | UUID PK, FK -> `listings.id` | One promo per listing |
| `description` | TEXT NOT NULL | AI-generated copy |
| `input_hash` | TEXT NOT NULL | Hash of generation inputs |
| `model` | TEXT NOT NULL | Model name used |
| `generated_at` | TIMESTAMPTZ NOT NULL | Generation timestamp |
| `updated_at` | TIMESTAMPTZ NOT NULL default now() | Audit |

### 8.2 Cache Validity

Regenerate when:
1. No cached row exists
2. `input_hash` differs (price/mileage/model fields changed)
3. Cache age > 30 days

### 8.3 Request Safeguards

- `MAX_AI_GENERATIONS_PER_REQUEST=5` (env-configurable)
- Generation concurrency: 2-3

---

## 9. Fallback Strategy

If AI is unavailable for any listing, generate deterministic template text:

`"Discover premium driving in this {year} {make} {model}{variant}, combining strong value at ${price} with {mileage} km in {region}."`

Fallback is always returned immediately and marked with `promo.source = "fallback"`.

---

## 10. Security and Compliance

1. Never include user identifiers or private profile data in prompt.
2. Prompt sanitization: trim and cap field lengths before calling OpenAI.
3. Output post-check: reject/replace text containing banned terms or unverifiable guarantee words.
4. Log only metadata (listing ID, latency, source, error code), not full prompt/response in production logs.

---

## 11. Observability

Track metrics:
- `luxury_promo_cache_hit_count`
- `luxury_promo_cache_miss_count`
- `luxury_promo_ai_success_count`
- `luxury_promo_ai_failure_count`
- `luxury_promo_fallback_count`
- `luxury_promo_ai_latency_ms`
- endpoint latency p50/p95 for `GET /luxury-vehicle`

Log structured events for:
- cache miss
- AI timeout/error
- upsert success/failure

---

## 12. Performance Targets (MVP)

1. `GET /luxury-vehicle` p95 < 900ms on warm cache.
2. `GET /luxury-vehicle` p95 < 1800ms on cold cache with capped generation.
3. AI error rate < 5% daily.
4. Cache hit rate > 80% after 24h of production traffic.

---

## 13. Rollout Plan

### Phase 1: Data + Internal Generation Utility

- Create `luxury_vehicle_promotions` table and index.
- Add OpenAI client utility + prompt builder + output validator.

### Phase 2: Endpoint Integration

- Extend `/luxury-vehicle` route to attach `promo` object.
- Implement cache read/write, capped generation, and fallback behavior.

### Phase 3: Hardening

- Add unit tests for prompt/output guardrails.
- Add integration tests for cache hit/miss/fallback cases.
- Add logging and metrics.

### Phase 4: Controlled Release

- Ship under feature flag: `LUXURY_PROMO_AI_ENABLED`.
- Enable in staging, validate latency/cost, then production rollout.

---

## 14. Acceptance Criteria

1. Each item from `GET /luxury-vehicle` includes `promo.description`, `promo.source`, and `promo.generatedAt`.
2. Endpoint still returns `200` when OpenAI errors/timeouts occur.
3. Cache table is used and updated for successful AI generations.
4. Copy follows tone/length policy and avoids prohibited claims.
5. Route-level tests cover:
   - cache hit path
   - cache miss with AI success
   - cache miss with AI failure fallback
   - generation cap per request

---

## 15. Open Questions

1. Should this endpoint require pagination before enabling AI in production (to reduce 200-item payload size)?
2. Should luxury promo text be localized (`en`, `zh`) in phase 2?
3. Should fallback text include price formatting by locale/currency utility?

