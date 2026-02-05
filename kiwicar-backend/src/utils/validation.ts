import { z } from "zod";

export const parseOr400 = <T>(
  schema: z.ZodSchema<T>,
  payload: unknown
): { success: true; data: T } | { success: false; error: { field?: string; message: string }[] } => {
  const parsed = schema.safeParse(payload);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  return {
    success: false,
    error: parsed.error.issues.map((issue) => ({
      field: issue.path.join(".") || undefined,
      message: issue.message,
    })),
  };
};
