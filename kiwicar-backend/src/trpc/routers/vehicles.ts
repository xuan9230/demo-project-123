import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../config/env";
import { supabase } from "../../config/supabase";
import { publicProcedure, router } from "../trpc";

const normalizePlate = (plate: string) => plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export const vehiclesRouter = router({
  lookupByPlate: publicProcedure
    .input(
      z.object({
        plateNumber: z.string().trim().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const plateNumber = normalizePlate(input.plateNumber);

      const { data: cached, error } = await supabase
        .from("vehicle_cache")
        .select("*")
        .eq("plate_number", plateNumber)
        .maybeSingle();

      if (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      }

      if (cached) {
        return {
          plateNumber: cached.plate_number,
          make: cached.make,
          model: cached.model,
          variant: cached.variant,
          year: cached.year,
          firstRegistered: cached.first_registered,
          wofStatus: cached.wof_status,
          wofExpiry: cached.wof_expiry,
          regoStatus: cached.rego_status,
          regoExpiry: cached.rego_expiry,
          odometerReadings: cached.odometer_readings,
          engineCC: cached.engine_cc,
          engineSize: cached.engine_cc ? `${cached.engine_cc}cc` : "",
          fuelType: cached.fuel_type ?? "petrol",
          bodyStyle: cached.body_style,
          bodyType: cached.body_style ?? "sedan",
          color: cached.color,
          cached: true,
          cachedAt: cached.fetched_at,
          queriesRemaining: null,
          dailyLimit: 10,
        };
      }

      if (!env.nztaApiKey || !env.nztaApiUrl) {
        throw new TRPCError({
          code: "METHOD_NOT_SUPPORTED",
          message: "NZTA integration not configured yet",
        });
      }

      throw new TRPCError({
        code: "METHOD_NOT_SUPPORTED",
        message: "NZTA lookup not implemented",
      });
    }),
});
