import { Router } from "express";
import { z } from "zod";
import { getSupabaseClient, supabase } from "../config/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { errorResponse, successResponse } from "../utils/response";
import { parseOr400 } from "../utils/validation";

export const favoritesRouter = Router();

const createSchema = z.object({
  listingId: z.string().uuid(),
  priceAlert: z.boolean().optional(),
  targetPrice: z.coerce.number().nonnegative().optional().nullable(),
});

const updateSchema = z.object({
  priceAlert: z.boolean().optional(),
  targetPrice: z.coerce.number().nonnegative().optional().nullable(),
});

favoritesRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient
    .from("favorites")
    .select("id,listing_id,price_alert,target_price,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  const listingIds = (data ?? []).map((favorite) => favorite.listing_id);
  const listingsById = new Map<string, any>();

  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id,make,model,variant,year,mileage,price,region,created_at,listing_images(url,order)")
      .in("id", listingIds);
    (listings ?? []).forEach((listing) => listingsById.set(listing.id, listing));
  }

  const response = (data ?? []).map((favorite) => {
    const listing = listingsById.get(favorite.listing_id);
    const images = listing?.listing_images ?? [];
    const coverImage = images
      .slice()
      .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))[0]
      ?.url;

    return {
      id: favorite.id,
      listingId: favorite.listing_id,
      listing: listing
        ? {
            id: listing.id,
            title: `${listing.year} ${listing.make} ${listing.model}${
              listing.variant ? ` ${listing.variant}` : ""
            }`,
            price: listing.price,
            year: listing.year,
            mileage: listing.mileage,
            region: listing.region,
            coverImage: coverImage ?? null,
            createdAt: listing.created_at,
          }
        : null,
      priceAlert: favorite.price_alert,
      targetPrice: favorite.target_price,
      priceChanged: false,
      originalPrice: null,
      currentPrice: listing?.price ?? null,
      createdAt: favorite.created_at,
    };
  });

  return res.status(200).json(successResponse(response));
});

favoritesRouter.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(createSchema, req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid favorite data", parsed.error));
  }

  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient
    .from("favorites")
    .insert({
      user_id: req.user?.id,
      listing_id: parsed.data.listingId,
      price_alert: parsed.data.priceAlert ?? false,
      target_price: parsed.data.targetPrice ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return res.status(400).json(errorResponse("DB_ERROR", error.message));
  }

  return res.status(201).json(successResponse({ id: data?.id }));
});

favoritesRouter.put("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const parsed = parseOr400(updateSchema, req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", "Invalid favorite update", parsed.error));
  }

  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json(errorResponse("VALIDATION_ERROR", "No fields provided"));
  }

  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient
    .from("favorites")
    .update({
      price_alert: parsed.data.priceAlert,
      target_price: parsed.data.targetPrice,
    })
    .eq("id", req.params.id)
    .select("id");

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (!data || data.length === 0) {
    return res.status(404).json(errorResponse("NOT_FOUND", "Favorite not found"));
  }

  return res.status(200).json(successResponse({ id: req.params.id }));
});

favoritesRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  const userClient = getSupabaseClient(req.accessToken);
  const { data, error } = await userClient
    .from("favorites")
    .delete()
    .eq("id", req.params.id)
    .select("id");

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (!data || data.length === 0) {
    return res.status(404).json(errorResponse("NOT_FOUND", "Favorite not found"));
  }

  return res.status(204).send();
});
