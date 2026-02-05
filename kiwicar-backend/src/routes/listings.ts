import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { getSupabaseClient, supabase } from "../config/supabase";
import { optionalAuth, requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { getPagination } from "../utils/pagination";
import { errorResponse, successResponse } from "../utils/response";
import { parseOr400 } from "../utils/validation";

export const listingsRouter = Router();

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).optional(),
  make: z.string().trim().min(1).optional(),
  model: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  minYear: z.coerce.number().int().optional(),
  maxYear: z.coerce.number().int().optional(),
  minMileage: z.coerce.number().nonnegative().optional(),
  maxMileage: z.coerce.number().nonnegative().optional(),
  region: z.string().trim().min(1).optional(),
  fuelType: z.string().trim().min(1).optional(),
  transmission: z.string().trim().min(1).optional(),
  bodyType: z.string().trim().min(1).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "mileage_asc"])
    .optional(),
});

const createSchema = z.object({
  plateNumber: z.string().trim().min(1),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  variant: z.string().trim().optional(),
  year: z.coerce.number().int().min(1900),
  mileage: z.coerce.number().int().nonnegative(),
  price: z.coerce.number().nonnegative(),
  priceNegotiable: z.boolean().optional(),
  description: z.string().trim().min(1),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]),
  transmission: z.enum(["auto", "manual"]),
  bodyType: z.string().trim().optional(),
  color: z.string().trim().optional(),
  engineCC: z.coerce.number().int().positive().optional(),
  region: z.string().trim().min(1),
  imageIds: z.array(z.string().trim().min(1)).optional(),
});

const updateSchema = createSchema.partial().omit({ plateNumber: true });

const statusSchema = z.object({
  status: z.enum(["active", "sold", "removed"]),
});

const normalizeQuery = (query: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );

const buildTitle = (listing: {
  year: number;
  make: string;
  model: string;
  variant?: string | null;
}) => `${listing.year} ${listing.make} ${listing.model}${listing.variant ? ` ${listing.variant}` : ""}`;

listingsRouter.get("/", optionalAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(querySchema, normalizeQuery(req.query));
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid query parameters", parsed.error));
  }

  const { page, limit, from, to } = getPagination(parsed.data.page ?? 1, parsed.data.limit ?? 20);

  let query = supabase
    .from("listings")
    .select("id,make,model,variant,year,mileage,price,region,created_at,listing_images(url,order)", {
      count: "exact",
    })
    .eq("status", "active");

  if (parsed.data.search) {
    const term = `%${parsed.data.search}%`;
    query = query.or(
      `make.ilike.${term},model.ilike.${term},variant.ilike.${term},description.ilike.${term}`
    );
  }
  if (parsed.data.make) {
    const makes = parsed.data.make.split(",").map((value) => value.trim()).filter(Boolean);
    if (makes.length > 0) {
      query = query.in("make", makes);
    }
  }
  if (parsed.data.model) {
    query = query.ilike("model", `%${parsed.data.model}%`);
  }
  if (parsed.data.minPrice !== undefined) {
    query = query.gte("price", parsed.data.minPrice);
  }
  if (parsed.data.maxPrice !== undefined) {
    query = query.lte("price", parsed.data.maxPrice);
  }
  if (parsed.data.minYear !== undefined) {
    query = query.gte("year", parsed.data.minYear);
  }
  if (parsed.data.maxYear !== undefined) {
    query = query.lte("year", parsed.data.maxYear);
  }
  if (parsed.data.minMileage !== undefined) {
    query = query.gte("mileage", parsed.data.minMileage);
  }
  if (parsed.data.maxMileage !== undefined) {
    query = query.lte("mileage", parsed.data.maxMileage);
  }
  if (parsed.data.region) {
    query = query.ilike("region", `%${parsed.data.region}%`);
  }
  if (parsed.data.fuelType) {
    query = query.eq("fuel_type", parsed.data.fuelType);
  }
  if (parsed.data.transmission) {
    query = query.eq("transmission", parsed.data.transmission);
  }
  if (parsed.data.bodyType) {
    query = query.eq("body_type", parsed.data.bodyType);
  }

  switch (parsed.data.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "mileage_asc":
      query = query.order("mileage", { ascending: true });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  let favoritedIds = new Set<string>();
  if (req.user && data && data.length > 0) {
    const userClient = getSupabaseClient(req.accessToken);
    const listingIds = data.map((listing) => listing.id);
    const favorites = await userClient
      .from("favorites")
      .select("listing_id")
      .in("listing_id", listingIds);
    if (favorites.data) {
      favoritedIds = new Set(favorites.data.map((favorite) => favorite.listing_id));
    }
  }

  const items = (data ?? []).map((listing) => {
    const images = listing.listing_images ?? [];
    const coverImage = images
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url;
    return {
      id: listing.id,
      title: buildTitle(listing),
      price: listing.price,
      year: listing.year,
      mileage: listing.mileage,
      region: listing.region,
      coverImage: coverImage ?? null,
      createdAt: listing.created_at,
      isFavorited: favoritedIds.has(listing.id),
    };
  });

  const total = count ?? items.length;
  return res.status(200).json(
    successResponse(items, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  );
});

listingsRouter.get("/:id", optionalAuth, async (req: AuthenticatedRequest, res) => {
  const listingId = req.params.id;
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }
  if (!listing) {
    return res.status(404).json(errorResponse("NOT_FOUND", "Listing not found"));
  }

  if (listing.status !== "active" && listing.user_id !== req.user?.id) {
    return res.status(403).json(errorResponse("FORBIDDEN", "Listing is not available"));
  }

  const [{ data: images, error: imagesError }, { data: priceHistory, error: historyError }] =
    await Promise.all([
      supabase
        .from("listing_images")
        .select("id,url,order")
        .eq("listing_id", listingId)
        .order("order", { ascending: true }),
      supabase
        .from("price_history")
        .select("price,changed_at")
        .eq("listing_id", listingId)
        .order("changed_at", { ascending: true }),
    ]);

  if (imagesError) {
    return res.status(500).json(errorResponse("DB_ERROR", imagesError.message));
  }
  if (historyError) {
    return res.status(500).json(errorResponse("DB_ERROR", historyError.message));
  }

  const { data: seller } = await supabase
    .from("profiles")
    .select("id,nickname,avatar,phone,created_at,show_phone_on_listings")
    .eq("id", listing.user_id)
    .maybeSingle();

  const { count: favoriteCount } = await supabase
    .from("favorites")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  let isFavorited = false;
  if (req.user) {
    const userClient = getSupabaseClient(req.accessToken);
    const favorite = await userClient
      .from("favorites")
      .select("id")
      .eq("listing_id", listingId)
      .maybeSingle();
    isFavorited = Boolean(favorite.data);
  }

  const response = {
    id: listing.id,
    plateNumber: listing.plate_number,
    make: listing.make,
    model: listing.model,
    variant: listing.variant,
    year: listing.year,
    mileage: listing.mileage,
    price: listing.price,
    priceNegotiable: listing.price_negotiable,
    description: listing.description,
    aiDescription: listing.ai_description,
    aiPriceMin: listing.ai_price_min,
    aiPriceMax: listing.ai_price_max,
    aiPriceRecommended: listing.ai_price_rec,
    fuelType: listing.fuel_type,
    transmission: listing.transmission,
    bodyType: listing.body_type,
    color: listing.color,
    engineCC: listing.engine_cc,
    region: listing.region,
    status: listing.status,
    wofExpiry: listing.wof_expiry,
    regoExpiry: listing.rego_expiry,
    images: (images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      order: image.order,
    })),
    seller: seller
      ? {
          id: seller.id,
          nickname: seller.nickname,
          avatar: seller.avatar,
          phone: seller.show_phone_on_listings ? seller.phone : null,
          memberSince: seller.created_at,
        }
      : null,
    viewCount: listing.view_count,
    favoriteCount: favoriteCount ?? 0,
    isFavorited,
    priceHistory: (priceHistory ?? []).map((entry) => ({
      price: entry.price,
      changedAt: entry.changed_at,
    })),
    createdAt: listing.created_at,
    updatedAt: listing.updated_at,
  };

  return res.status(200).json(successResponse(response));
});

listingsRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(createSchema, req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid listing data", parsed.error));
  }

  const userClient = getSupabaseClient(req.accessToken);
  const payload = parsed.data;

  const { data: listing, error } = await userClient
    .from("listings")
    .insert({
      user_id: req.user?.id,
      plate_number: payload.plateNumber,
      make: payload.make,
      model: payload.model,
      variant: payload.variant ?? null,
      year: payload.year,
      mileage: payload.mileage,
      price: payload.price,
      price_negotiable: payload.priceNegotiable ?? false,
      description: payload.description,
      fuel_type: payload.fuelType,
      transmission: payload.transmission,
      body_type: payload.bodyType ?? null,
      color: payload.color ?? null,
      engine_cc: payload.engineCC ?? null,
      region: payload.region,
      status: "active",
    })
    .select("*")
    .single();

  if (error || !listing) {
    return res.status(400).json(errorResponse("DB_ERROR", error?.message ?? "Insert failed"));
  }

  if (payload.imageIds && payload.imageIds.length > 0) {
    const imagesToInsert = payload.imageIds.map((imageId, index) => {
      const url = imageId.startsWith("http")
        ? imageId
        : userClient.storage.from(env.supabaseImageBucket).getPublicUrl(imageId).data.publicUrl;
      return {
        listing_id: listing.id,
        url,
        order: index + 1,
      };
    });
    const { error: imagesError } = await userClient.from("listing_images").insert(imagesToInsert);
    if (imagesError) {
      return res.status(500).json(errorResponse("DB_ERROR", imagesError.message));
    }
  }

  const { error: historyError } = await userClient.from("price_history").insert({
    listing_id: listing.id,
    price: listing.price,
  });
  if (historyError) {
    return res.status(500).json(errorResponse("DB_ERROR", historyError.message));
  }

  return res.status(201).json(successResponse({ id: listing.id, status: listing.status }));
});

listingsRouter.put("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(updateSchema, req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid listing update", parsed.error));
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json(errorResponse("VALIDATION_ERROR", "No fields provided"));
  }

  const listingId = req.params.id;
  const userClient = getSupabaseClient(req.accessToken);
  const updatePayload: Record<string, unknown> = {
    make: parsed.data.make,
    model: parsed.data.model,
    variant: parsed.data.variant ?? undefined,
    year: parsed.data.year,
    mileage: parsed.data.mileage,
    price: parsed.data.price,
    price_negotiable: parsed.data.priceNegotiable,
    description: parsed.data.description,
    fuel_type: parsed.data.fuelType,
    transmission: parsed.data.transmission,
    body_type: parsed.data.bodyType,
    color: parsed.data.color,
    engine_cc: parsed.data.engineCC,
    region: parsed.data.region,
  };

  Object.keys(updatePayload).forEach((key) => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  const { data: updated, error } = await userClient
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId)
    .select("*");

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (!updated || updated.length === 0) {
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .maybeSingle();
    if (existing) {
      return res.status(403).json(errorResponse("FORBIDDEN", "Not allowed to update listing"));
    }
    return res.status(404).json(errorResponse("NOT_FOUND", "Listing not found"));
  }

  const updatedListing = updated[0];
  if (parsed.data.price !== undefined) {
    await userClient.from("price_history").insert({
      listing_id: listingId,
      price: updatedListing.price,
    });
  }

  return res.status(200).json(successResponse({ id: listingId }));
});

listingsRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const listingId = req.params.id;
  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient.from("listings").delete().eq("id", listingId).select("id");

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (!data || data.length === 0) {
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .maybeSingle();
    if (existing) {
      return res.status(403).json(errorResponse("FORBIDDEN", "Not allowed to delete listing"));
    }
    return res.status(404).json(errorResponse("NOT_FOUND", "Listing not found"));
  }

  return res.status(204).send();
});

listingsRouter.put("/:id/status", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(statusSchema, req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid status", parsed.error));
  }

  const listingId = req.params.id;
  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient
    .from("listings")
    .update({ status: parsed.data.status })
    .eq("id", listingId)
    .select("id");

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (!data || data.length === 0) {
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .eq("id", listingId)
      .maybeSingle();
    if (existing) {
      return res.status(403).json(errorResponse("FORBIDDEN", "Not allowed to update listing"));
    }
    return res.status(404).json(errorResponse("NOT_FOUND", "Listing not found"));
  }

  return res.status(200).json(successResponse({ id: listingId, status: parsed.data.status }));
});

listingsRouter.post("/:id/view", async (req, res) => {
  const listingId = req.params.id;
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id,view_count")
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }
  if (!listing) {
    return res.status(404).json(errorResponse("NOT_FOUND", "Listing not found"));
  }

  const updatedCount = (listing.view_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("listings")
    .update({ view_count: updatedCount })
    .eq("id", listingId);

  if (updateError) {
    return res.status(500).json(errorResponse("DB_ERROR", updateError.message));
  }

  return res.status(200).json(successResponse({ id: listingId, viewCount: updatedCount }));
});
