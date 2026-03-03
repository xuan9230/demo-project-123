import { TRPCError } from "@trpc/server";
import { supabase } from "../../config/supabase";
import { publicProcedure, router } from "../trpc";

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

export const luxuryVehicleRouter = router({
  list: publicProcedure.query(async () => {
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id,make,model,variant,year,mileage,price,region,status,created_at,fuel_type,transmission,body_type,listing_images(url,order)"
      )
      .eq("status", "active")
      .gt("price", 100000)
      .order("price", { ascending: false })
      .limit(200);

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    }

    return (data ?? []).map((listing) => {
      const images = listing.listing_images ?? [];
      const coverImage = images.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url;

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
      };
    });
  }),
});
