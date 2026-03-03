import { TRPCError, initTRPC } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, supabase } from "../config/supabase";

const getAccessToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const accessToken = getAccessToken(req.headers.authorization);

  let user: User | null = null;
  if (accessToken) {
    const { data } = await supabase.auth.getUser(accessToken);
    user = data.user;
  }

  return {
    req,
    res,
    user,
    accessToken,
    supabaseClient: getSupabaseClient(accessToken ?? undefined),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const optionalAuthProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing or invalid Authorization header",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      accessToken: ctx.accessToken,
    },
  });
});
