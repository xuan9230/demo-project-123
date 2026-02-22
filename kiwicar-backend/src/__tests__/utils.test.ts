import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseOr400 } from "../utils/validation";
import { getPagination } from "../utils/pagination";

describe("parseOr400", () => {
  const schema = z.object({
    name: z.string().min(2),
    age: z.number().int(),
  });

  it("returns parsed data on success", () => {
    const result = parseOr400(schema, { name: "Aroha", age: 25 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: "Aroha", age: 25 });
    }
  });

  it("returns field errors on failure", () => {
    const result = parseOr400(schema, { name: "A", age: "nope" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "name" }),
          expect.objectContaining({ field: "age" }),
        ])
      );
    }
  });
});

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
