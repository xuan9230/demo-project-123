import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { supabase } from "../../config/supabase";
import { protectedProcedure, router } from "../trpc";

const createSchema = z.object({
  listingId: z.string().uuid(),
  priceAlert: z.boolean().optional(),
  targetPrice: z.coerce.number().nonnegative().optional().nullable(),
});

const updateSchema = z.object({
  priceAlert: z.boolean().optional(),
  targetPrice: z.coerce.number().nonnegative().optional().nullable(),
});

const buildTitle = (listing: {
  year: number;
  make: string;
  model: string;
  variant?: string | null;
}) => `${listing.year} ${listing.make} ${listing.model}${listing.variant ? ` ${listing.variant}` : ""}`;

const mapTransmission = (transmission: string | null) => {
  if (transmission === "auto") {
    return "automatic";
  }
  if (transmission === "manual") {
    return "manual";
  }
  return "automatic";
};

export const favoritesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabaseClient
      .from("favorites")
      .select("id,listing_id,price_alert,target_price,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    const listingIds = (data ?? []).map((favorite: { listing_id: string }) => favorite.listing_id);
    const listingsById = new Map<string, any>();

    if (listingIds.length > 0) {
      const { data: listings } = await supabase
        .from("listings")
        .select(
          "id,make,model,variant,year,mileage,price,region,status,created_at,fuel_type,transmission,body_type,listing_images(url,order)"
        )
        .in("id", listingIds);

      (listings ?? []).forEach((listing: any) => listingsById.set(listing.id, listing));
    }

    return (data ?? []).map((favorite: any) => {
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
              title: buildTitle(listing),
              make: listing.make,
              model: listing.model,
              year: listing.year,
              price: Number(listing.price),
              mileage: listing.mileage,
              region: listing.region,
              coverImage: coverImage ?? null,
              createdAt: listing.created_at,
              status: listing.status,
              fuelType: listing.fuel_type,
              transmission: mapTransmission(listing.transmission),
              bodyType: listing.body_type,
              isFavorited: true,
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
  }),

  add: protectedProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabaseClient
      .from("favorites")
      .insert({
        user_id: ctx.user.id,
        listing_id: input.listingId,
        price_alert: input.priceAlert ?? false,
        target_price: input.targetPrice ?? null,
      })
      .select("id")
      .single();

    if (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
    }

    return { id: data?.id };
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (Object.keys(input.data).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields provided" });
      }

      const { data, error } = await ctx.supabaseClient
        .from("favorites")
        .update({
          price_alert: input.data.priceAlert,
          target_price: input.data.targetPrice,
        })
        .eq("id", input.id)
        .select("id");

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!data || data.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Favorite not found" });
      }

      return { id: input.id };
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseClient
        .from("favorites")
        .delete()
        .eq("id", input.id)
        .select("id");

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!data || data.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Favorite not found" });
      }

      return { id: input.id };
    }),
});
