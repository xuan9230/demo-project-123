import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const messagesRouter = router({
  conversations: protectedProcedure.query(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
  getConversation: protectedProcedure.input(z.object({ id: z.string().min(1) })).query(() => {
    throw new TRPCError({ code: "METHOD_NOT_SUPPORTED", message: "Not implemented" });
  }),
});
