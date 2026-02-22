import type { Request, Response, NextFunction } from "express";
import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserMock } = vi.hoisted(() => ({
  getUserMock: vi.fn(),
}));

vi.mock("../config/supabase", () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
    },
  },
}));

import { optionalAuth, requireAuth } from "../middleware/auth";

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return res as unknown as Response;
};

const createNext = () => vi.fn() as unknown as NextFunction;

const createRequest = (authorization?: string) =>
  ({
    headers: authorization ? { authorization } : {},
  }) as unknown as Request;

describe("requireAuth", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing Authorization header" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header is invalid", async () => {
    const req = createRequest("Token abc123");
    const res = createResponse();
    const next = createNext();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid Authorization header" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = createRequest("Bearer bad-token");
    const res = createResponse();
    const next = createNext();

    await requireAuth(req, res, next);

    expect(getUserMock).toHaveBeenCalledWith("bad-token");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches user and token when valid", async () => {
    const user = { id: "user-1" } as User;
    getUserMock.mockResolvedValueOnce({ data: { user }, error: null });

    const req = createRequest("Bearer good-token") as Request & {
      user?: User;
      accessToken?: string;
    };
    const res = createResponse();
    const next = createNext();

    await requireAuth(req, res, next);

    expect(getUserMock).toHaveBeenCalledWith("good-token");
    expect(req.user).toBe(user);
    expect(req.accessToken).toBe("good-token");
    expect(next).toHaveBeenCalled();
  });
});

describe("optionalAuth", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("skips when Authorization header is missing", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await optionalAuth(req, res, next);

    expect(getUserMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("skips when Authorization header is invalid", async () => {
    const req = createRequest("Token nope");
    const res = createResponse();
    const next = createNext();

    await optionalAuth(req, res, next);

    expect(getUserMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("attaches user when token is valid", async () => {
    const user = { id: "user-2" } as User;
    getUserMock.mockResolvedValueOnce({ data: { user }, error: null });

    const req = createRequest("Bearer opt-token") as Request & {
      user?: User;
      accessToken?: string;
    };
    const res = createResponse();
    const next = createNext();

    await optionalAuth(req, res, next);

    expect(getUserMock).toHaveBeenCalledWith("opt-token");
    expect(req.user).toBe(user);
    expect(req.accessToken).toBe("opt-token");
    expect(next).toHaveBeenCalled();
  });
});
