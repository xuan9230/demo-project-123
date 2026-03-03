import { describe, expect, it } from "vitest";
import { getPagination } from "../utils/pagination";

describe("getPagination", () => {
  it("uses defaults for non-finite inputs", () => {
    const result = getPagination(Number.NaN, Number.POSITIVE_INFINITY);
    expect(result).toEqual({ page: 1, limit: 20, from: 0, to: 19 });
  });

  it("clamps page and limit", () => {
    const result = getPagination(-3, 100);
    expect(result).toEqual({ page: 1, limit: 50, from: 0, to: 49 });
  });

  it("calculates from/to offsets", () => {
    const result = getPagination(2, 10);
    expect(result).toEqual({ page: 2, limit: 10, from: 10, to: 19 });
  });
});
