import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PORT: z.string().optional(),
  CORS_ORIGIN: z.string().optional(),
  SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_IMAGE_BUCKET: z.string().optional(),
  NZTA_API_KEY: z.string().optional(),
  NZTA_API_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => issue.message).join("; ");
  throw new Error(`Environment validation error: ${message}`);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV ?? "development",
  port: parsed.data.PORT ? Number(parsed.data.PORT) : 3001,
  corsOrigin: parsed.data.CORS_ORIGIN ?? "",
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabaseAnonKey: parsed.data.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseImageBucket: parsed.data.SUPABASE_IMAGE_BUCKET ?? "kiwicar-images",
  nztaApiKey: parsed.data.NZTA_API_KEY ?? "",
  nztaApiUrl: parsed.data.NZTA_API_URL ?? "",
  openaiApiKey: parsed.data.OPENAI_API_KEY ?? "",
};
