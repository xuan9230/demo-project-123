import { Router } from "express";
import { supabase } from "../config/supabase";
import { errorResponse, successResponse } from "../utils/response";
import { enrichWithPromos } from "../utils/luxury-promo";
import type { LuxuryVehicleInput } from "../utils/openai";

export const luxuryVehicleRouter = Router();

const buildTitle = (listing: {
  year: number;
  make: string;
  model: string;
  variant?: string | null;
}) => `${listing.year} ${listing.make} ${listing.model}${listing.variant ? ` ${listing.variant}` : ""}`;

luxuryVehicleRouter.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("listings")
    .select("id,make,model,variant,year,mileage,price,region,created_at,listing_images(url,order)")
    .eq("status", "active")
    .gt("price", 100000)
    .order("price", { ascending: false })
    .limit(200);

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  const listings = data ?? [];

  const promoInputs: LuxuryVehicleInput[] = listings.map((listing) => ({
    id: listing.id,
    year: listing.year,
    make: listing.make,
    model: listing.model,
    variant: listing.variant,
    mileage: listing.mileage,
    price: listing.price,
    region: listing.region,
  }));

  const promos = await enrichWithPromos(promoInputs);

  const items = listings.map((listing) => {
    const images = listing.listing_images ?? [];
    const coverImage = images
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url;
    const promo = promos.get(listing.id) ?? {
      description: "",
      source: "fallback" as const,
      generatedAt: null,
    };
    return {
      id: listing.id,
      title: buildTitle(listing),
      price: listing.price,
      year: listing.year,
      mileage: listing.mileage,
      region: listing.region,
      coverImage: coverImage ?? null,
      createdAt: listing.created_at,
      promo,
    };
  });

  return res.status(200).json(successResponse(items));
});
