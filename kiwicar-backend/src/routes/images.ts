import { randomUUID } from "crypto";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { env } from "../config/env";
import { getSupabaseClient } from "../config/supabase";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { errorResponse, successResponse } from "../utils/response";

export const imagesRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are supported"));
    }
    return cb(null, true);
  },
});

imagesRouter.post(
  "/upload",
  requireAuth,
  upload.array("images", 10),
  async (req: AuthenticatedRequest, res) => {
    if (!req.accessToken) {
      return res.status(401).json(errorResponse("UNAUTHORIZED", "Missing access token"));
    }
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json(errorResponse("VALIDATION_ERROR", "No images uploaded"));
    }

    const client = getSupabaseClient(req.accessToken);
    const bucket = env.supabaseImageBucket;
    const uploads: { id: string; url: string }[] = [];

    for (const file of files) {
      const extension = path.extname(file.originalname) || `.${file.mimetype.split("/")[1]}`;
      const objectPath = `listings/${req.user?.id ?? "anonymous"}/${randomUUID()}${extension}`;
      const { error } = await client.storage.from(bucket).upload(objectPath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

      if (error) {
        return res.status(500).json(errorResponse("UPLOAD_FAILED", error.message));
      }

      const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
      uploads.push({ id: objectPath, url: data.publicUrl });
    }

    return res.status(201).json(successResponse(uploads));
  }
);
