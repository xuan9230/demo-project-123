import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../config/env";
import { supabase } from "../../config/supabase";
import { getPagination } from "../../utils/pagination";
import { optionalAuthProcedure, protectedProcedure, publicProcedure, router } from "../trpc";

const listInputSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
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
  sort: z.enum(["price_asc", "price_desc", "newest", "mileage_asc"]).optional(),
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

export const listingsRouter = router({
  list: optionalAuthProcedure.input(listInputSchema.optional()).query(async ({ ctx, input }) => {
    const parsedInput = input ?? {};
    const currentPage = parsedInput.cursor ?? parsedInput.page ?? 1;
    const { page, limit, from, to } = getPagination(currentPage, parsedInput.limit ?? 20);

    let query = supabase
      .from("listings")
      .select(
        "id,make,model,variant,year,mileage,price,region,created_at,status,fuel_type,transmission,body_type,listing_images(url,order)",
        {
          count: "exact",
        }
      )
      .eq("status", "active");

    if (parsedInput.search) {
      const term = `%${parsedInput.search}%`;
      query = query.or(
        `make.ilike.${term},model.ilike.${term},variant.ilike.${term},description.ilike.${term}`
      );
    }
    if (parsedInput.make) {
      const makes = parsedInput.make
        .split(",")
        .map((value: string) => value.trim())
        .filter(Boolean);
      if (makes.length > 0) {
        query = query.in("make", makes);
      }
    }
    if (parsedInput.model) {
      query = query.ilike("model", `%${parsedInput.model}%`);
    }
    if (parsedInput.minPrice !== undefined) {
      query = query.gte("price", parsedInput.minPrice);
    }
    if (parsedInput.maxPrice !== undefined) {
      query = query.lte("price", parsedInput.maxPrice);
    }
    if (parsedInput.minYear !== undefined) {
      query = query.gte("year", parsedInput.minYear);
    }
    if (parsedInput.maxYear !== undefined) {
      query = query.lte("year", parsedInput.maxYear);
    }
    if (parsedInput.minMileage !== undefined) {
      query = query.gte("mileage", parsedInput.minMileage);
    }
    if (parsedInput.maxMileage !== undefined) {
      query = query.lte("mileage", parsedInput.maxMileage);
    }
    if (parsedInput.region) {
      query = query.ilike("region", `%${parsedInput.region}%`);
    }
    if (parsedInput.fuelType) {
      query = query.eq("fuel_type", parsedInput.fuelType);
    }
    if (parsedInput.transmission) {
      query = query.eq("transmission", parsedInput.transmission);
    }
    if (parsedInput.bodyType) {
      query = query.eq("body_type", parsedInput.bodyType);
    }

    switch (parsedInput.sort) {
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
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    let favoritedIds = new Set<string>();
    if (ctx.user && data && data.length > 0) {
      const listingIds = data.map((listing: { id: string }) => listing.id);
      const favorites = await ctx.supabaseClient
        .from("favorites")
        .select("listing_id")
        .in("listing_id", listingIds);
      if (favorites.data) {
        favoritedIds = new Set(
          favorites.data.map((favorite: { listing_id: string }) => favorite.listing_id)
        );
      }
    }

    const items = (data ?? []).map((listing: any) => {
      const images = listing.listing_images ?? [];
      const coverImage = images
        .slice()
        .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))[0]
        ?.url;

      return {
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
        isFavorited: favoritedIds.has(listing.id),
      };
    });

    const total = count ?? items.length;

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      nextCursor: page * limit < total ? page + 1 : undefined,
    };
  }),

  getById: optionalAuthProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", input.id)
        .maybeSingle();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      if (listing.status !== "active" && listing.user_id !== ctx.user?.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Listing is not available" });
      }

      const [{ data: images, error: imagesError }, { data: priceHistory, error: historyError }] =
        await Promise.all([
          supabase
            .from("listing_images")
            .select("id,url,order")
            .eq("listing_id", input.id)
            .order("order", { ascending: true }),
          supabase
            .from("price_history")
            .select("price,changed_at")
            .eq("listing_id", input.id)
            .order("changed_at", { ascending: true }),
        ]);

      if (imagesError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: imagesError.message });
      }
      if (historyError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: historyError.message });
      }

      const { data: seller } = await supabase
        .from("profiles")
        .select("id,nickname,avatar,phone,created_at,show_phone_on_listings")
        .eq("id", listing.user_id)
        .maybeSingle();

      const { count: favoriteCount } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("listing_id", input.id);

      let isFavorited = false;
      if (ctx.user) {
        const favorite = await ctx.supabaseClient
          .from("favorites")
          .select("id")
          .eq("listing_id", input.id)
          .maybeSingle();
        isFavorited = Boolean(favorite.data);
      }

      return {
        id: listing.id,
        title: buildTitle(listing),
        plateNumber: listing.plate_number,
        make: listing.make,
        model: listing.model,
        variant: listing.variant,
        year: listing.year,
        mileage: listing.mileage,
        price: Number(listing.price),
        priceNegotiable: listing.price_negotiable,
        description: listing.description,
        aiDescription: listing.ai_description,
        aiPriceMin: listing.ai_price_min,
        aiPriceMax: listing.ai_price_max,
        aiPriceRecommended: listing.ai_price_rec,
        fuelType: listing.fuel_type,
        transmission: mapTransmission(listing.transmission),
        bodyType: listing.body_type,
        color: listing.color,
        engineCC: listing.engine_cc,
        engineSize: listing.engine_cc ? `${listing.engine_cc}cc` : "-",
        region: listing.region,
        status: listing.status,
        wofExpiry: listing.wof_expiry,
        regoExpiry: listing.rego_expiry,
        firstRegistered: `${listing.year}-01-01`,
        images: (images ?? []).map((image) => image.url),
        seller: seller
          ? {
              id: seller.id,
              nickname: seller.nickname,
              avatar: seller.avatar,
              phone: seller.show_phone_on_listings ? seller.phone : null,
              memberSince: seller.created_at,
            }
          : null,
        sellerId: seller?.id ?? listing.user_id,
        sellerName: seller?.nickname ?? "Private Seller",
        sellerPhone: seller?.show_phone_on_listings ? seller.phone : null,
        sellerAvatar: seller?.avatar ?? null,
        viewCount: listing.view_count,
        favoriteCount: favoriteCount ?? 0,
        isFavorited,
        priceHistory: (priceHistory ?? []).map((entry) => ({
          price: Number(entry.price),
          changedAt: entry.changed_at,
        })),
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
      };
    }),

  myListings: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabaseClient
      .from("listings")
      .select(
        "id,make,model,variant,year,mileage,price,region,status,view_count,created_at,updated_at,plate_number,description,fuel_type,transmission,body_type,color,engine_cc,wof_expiry,rego_expiry,listing_images(url,order)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    const listingIds = (data ?? []).map((listing: { id: string }) => listing.id);
    const favoriteCounts = new Map<string, number>();

    if (listingIds.length > 0) {
      const { data: favorites } = await supabase
        .from("favorites")
        .select("listing_id")
        .in("listing_id", listingIds);

      (favorites ?? []).forEach((favorite: { listing_id: string }) => {
        favoriteCounts.set(favorite.listing_id, (favoriteCounts.get(favorite.listing_id) ?? 0) + 1);
      });
    }

    return (data ?? []).map((listing: any) => ({
      id: listing.id,
      title: buildTitle(listing),
      make: listing.make,
      model: listing.model,
      year: listing.year,
      price: Number(listing.price),
      mileage: listing.mileage,
      region: listing.region,
      images: (listing.listing_images ?? [])
        .slice()
        .sort((a: { order?: number }, b: { order?: number }) => (a.order ?? 0) - (b.order ?? 0))
        .map((image: { url: string }) => image.url),
      description: listing.description,
      fuelType: listing.fuel_type,
      transmission: mapTransmission(listing.transmission),
      bodyType: listing.body_type ?? "sedan",
      engineSize: listing.engine_cc ? `${listing.engine_cc}cc` : "-",
      color: listing.color ?? "-",
      plateNumber: listing.plate_number,
      wofExpiry: listing.wof_expiry ?? listing.created_at,
      regoExpiry: listing.rego_expiry ?? listing.created_at,
      firstRegistered: `${listing.year}-01-01`,
      status: listing.status,
      sellerId: ctx.user.id,
      sellerName: "You",
      viewCount: listing.view_count ?? 0,
      favoriteCount: favoriteCounts.get(listing.id) ?? 0,
      createdAt: listing.created_at,
      updatedAt: listing.updated_at,
    }));
  }),

  create: protectedProcedure.input(createSchema).mutation(async ({ ctx, input }) => {
    const { data: listing, error } = await ctx.supabaseClient
      .from("listings")
      .insert({
        user_id: ctx.user.id,
        plate_number: input.plateNumber,
        make: input.make,
        model: input.model,
        variant: input.variant ?? null,
        year: input.year,
        mileage: input.mileage,
        price: input.price,
        price_negotiable: input.priceNegotiable ?? false,
        description: input.description,
        fuel_type: input.fuelType,
        transmission: input.transmission,
        body_type: input.bodyType ?? null,
        color: input.color ?? null,
        engine_cc: input.engineCC ?? null,
        region: input.region,
        status: "active",
      })
      .select("*")
      .single();

    if (error || !listing) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error?.message ?? "Insert failed",
      });
    }

    if (input.imageIds && input.imageIds.length > 0) {
      const imagesToInsert = input.imageIds.map((imageId: string, index: number) => {
        const url = imageId.startsWith("http")
          ? imageId
          : ctx.supabaseClient.storage.from(env.supabaseImageBucket).getPublicUrl(imageId).data.publicUrl;

        return {
          listing_id: listing.id,
          url,
          order: index + 1,
        };
      });

      const { error: imagesError } = await ctx.supabaseClient
        .from("listing_images")
        .insert(imagesToInsert);
      if (imagesError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: imagesError.message });
      }
    }

    const { error: historyError } = await ctx.supabaseClient.from("price_history").insert({
      listing_id: listing.id,
      price: listing.price,
    });
    if (historyError) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: historyError.message });
    }

    return {
      id: listing.id,
      status: listing.status,
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        data: updateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (Object.keys(input.data).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No fields provided" });
      }

      const updatePayload: Record<string, unknown> = {
        make: input.data.make,
        model: input.data.model,
        variant: input.data.variant,
        year: input.data.year,
        mileage: input.data.mileage,
        price: input.data.price,
        price_negotiable: input.data.priceNegotiable,
        description: input.data.description,
        fuel_type: input.data.fuelType,
        transmission: input.data.transmission,
        body_type: input.data.bodyType,
        color: input.data.color,
        engine_cc: input.data.engineCC,
        region: input.data.region,
      };

      Object.keys(updatePayload).forEach((key) => {
        if (updatePayload[key] === undefined) {
          delete updatePayload[key];
        }
      });

      const { data: updated, error } = await ctx.supabaseClient
        .from("listings")
        .update(updatePayload)
        .eq("id", input.id)
        .select("*");

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!updated || updated.length === 0) {
        const { data: existing } = await supabase
          .from("listings")
          .select("id")
          .eq("id", input.id)
          .maybeSingle();

        if (existing) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed to update listing" });
        }
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      const updatedListing = updated[0];
      if (input.data.price !== undefined) {
        await ctx.supabaseClient.from("price_history").insert({
          listing_id: input.id,
          price: updatedListing.price,
        });
      }

      return { id: input.id };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseClient
        .from("listings")
        .delete()
        .eq("id", input.id)
        .select("id");

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!data || data.length === 0) {
        const { data: existing } = await supabase
          .from("listings")
          .select("id")
          .eq("id", input.id)
          .maybeSingle();

        if (existing) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed to delete listing" });
        }

        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      return { id: input.id };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: statusSchema.shape.status,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabaseClient
        .from("listings")
        .update({ status: input.status })
        .eq("id", input.id)
        .select("id");

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (!data || data.length === 0) {
        const { data: existing } = await supabase
          .from("listings")
          .select("id")
          .eq("id", input.id)
          .maybeSingle();

        if (existing) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not allowed to update listing" });
        }
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      return { id: input.id, status: input.status };
    }),

  incrementView: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const { data: listing, error } = await supabase
        .from("listings")
        .select("id,view_count")
        .eq("id", input.id)
        .maybeSingle();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }
      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      const updatedCount = (listing.view_count ?? 0) + 1;
      const { error: updateError } = await supabase
        .from("listings")
        .update({ view_count: updatedCount })
        .eq("id", input.id);

      if (updateError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: updateError.message });
      }

      return { id: input.id, viewCount: updatedCount };
    }),
});
