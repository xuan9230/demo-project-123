export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getPagination = (page: number, limit: number) => {
  const safePage = Number.isFinite(page) ? page : 1;
  const safeLimit = Number.isFinite(limit) ? limit : 20;
  const boundedLimit = clamp(safeLimit, 1, 50);
  const boundedPage = Math.max(1, safePage);
  const from = (boundedPage - 1) * boundedLimit;
  const to = from + boundedLimit - 1;
  return { page: boundedPage, limit: boundedLimit, from, to };
};
