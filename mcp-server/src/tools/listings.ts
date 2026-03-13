import { supabase } from "../config/supabase.js";

export interface VehicleListing {
  id: string;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  mileage: number;
  price: number;
  price_negotiable: boolean;
  fuel_type: string;
  transmission: string;
  body_type: string | null;
  color: string | null;
  region: string;
  description: string | null;
  status: string;
  view_count: number;
  cover_image: string | null;
}

export async function getRandomListing(): Promise<VehicleListing> {
  // Count active listings
  const { count, error: countError } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (countError) throw new Error(`Failed to count listings: ${countError.message}`);
  if (!count || count === 0) throw new Error("No active listings found in the database");

  // Pick a random offset
  const randomOffset = Math.floor(Math.random() * count);

  // Fetch the listing at that offset, joining the first image
  const { data, error } = await supabase
    .from("listings")
    .select(
      `
      id,
      make,
      model,
      variant,
      year,
      mileage,
      price,
      price_negotiable,
      fuel_type,
      transmission,
      body_type,
      color,
      region,
      description,
      status,
      view_count,
      listing_images (url, order)
    `
    )
    .eq("status", "active")
    .range(randomOffset, randomOffset)
    .single();

  if (error) throw new Error(`Failed to fetch listing: ${error.message}`);
  if (!data) throw new Error("No listing returned");

  // Extract cover image (lowest order value)
  const images = (data.listing_images as { url: string; order: number }[]) ?? [];
  images.sort((a, b) => a.order - b.order);
  const cover_image = images[0]?.url ?? null;

  return {
    id: data.id,
    make: data.make,
    model: data.model,
    variant: data.variant,
    year: data.year,
    mileage: data.mileage,
    price: data.price,
    price_negotiable: data.price_negotiable,
    fuel_type: data.fuel_type,
    transmission: data.transmission,
    body_type: data.body_type,
    color: data.color,
    region: data.region,
    description: data.description,
    status: data.status,
    view_count: data.view_count,
    cover_image,
  };
}

export function formatListing(listing: VehicleListing): string {
  const title = [listing.year, listing.make, listing.model, listing.variant]
    .filter(Boolean)
    .join(" ");
  const price = `NZD $${Number(listing.price).toLocaleString()}${listing.price_negotiable ? " (negotiable)" : ""}`;
  const specs = [listing.fuel_type, listing.transmission, listing.body_type]
    .filter(Boolean)
    .join(" · ");

  return [
    `🚗 **${title}**`,
    `💰 ${price}`,
    `📍 ${listing.region}`,
    `🛣️  ${Number(listing.mileage).toLocaleString()} km`,
    specs ? `⚙️  ${specs}` : null,
    listing.color ? `🎨 ${listing.color}` : null,
    listing.description ? `\n${listing.description}` : null,
    listing.cover_image ? `\n🖼️  ${listing.cover_image}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
