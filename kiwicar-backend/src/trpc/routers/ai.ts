import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const aiRouter = router({
  generateDescription: protectedProcedure.input(z.object({}).passthrough()).mutation(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
  pricing: publicProcedure.input(z.object({}).passthrough().optional()).query(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
});
