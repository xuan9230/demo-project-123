import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const usersRouter = router({
  me: protectedProcedure.query(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
  updateMe: protectedProcedure.input(z.object({}).passthrough()).mutation(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
});
