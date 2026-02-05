export const successResponse = <T>(data: T, meta?: Record<string, unknown>) => {
  if (meta) {
    return { success: true, data, meta };
  }
  return { success: true, data };
};

export const errorResponse = (
  code: string,
  message: string,
  details?: Array<{ field?: string; message: string }>
) => ({
  success: false,
  error: { code, message, details },
});
