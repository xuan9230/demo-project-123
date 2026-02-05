import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

const baseOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, baseOptions);

export const getSupabaseClient = (accessToken?: string) => {
  if (!accessToken) {
    return supabase;
  }
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...baseOptions,
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

export const getSupabaseServiceClient = () => {
  if (!env.supabaseServiceRoleKey) {
    return null;
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, baseOptions);
};
