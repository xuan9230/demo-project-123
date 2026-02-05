import { Router } from "express";
import { env } from "../config/env";
import { supabase } from "../config/supabase";
import { errorResponse, successResponse } from "../utils/response";

export const vehiclesRouter = Router();

const normalizePlate = (plate: string) => plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

vehiclesRouter.get("/:plateNumber", async (req, res) => {
  const plateNumber = normalizePlate(req.params.plateNumber);

  const { data: cached, error } = await supabase
    .from("vehicle_cache")
    .select("*")
    .eq("plate_number", plateNumber)
    .maybeSingle();

  if (error) {
    return res.status(500).json(errorResponse("DB_ERROR", error.message));
  }

  if (cached) {
    return res.status(200).json(
      successResponse(
        {
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
          fuelType: cached.fuel_type,
          bodyStyle: cached.body_style,
          color: cached.color,
          cached: true,
          cachedAt: cached.fetched_at,
        },
        {
          queriesRemaining: null,
          dailyLimit: 10,
        }
      )
    );
  }

  if (!env.nztaApiKey || !env.nztaApiUrl) {
    return res.status(501).json(
      errorResponse("NOT_IMPLEMENTED", "NZTA integration not configured yet")
    );
  }

  return res.status(501).json(errorResponse("NOT_IMPLEMENTED", "NZTA lookup not implemented"));
});
