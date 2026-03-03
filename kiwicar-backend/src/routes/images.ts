import { randomUUID } from "crypto";
import path from "path";
import { Router } from "express";
import multer from "multer";
import { env } from "../config/env";
import { getSupabaseClient, supabase } from "../config/supabase";

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

const getAccessToken = (authorizationHeader?: string | string[]): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  if (Array.isArray(authorizationHeader)) {
    return getAccessToken(authorizationHeader[0]);
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

imagesRouter.post("/upload", upload.array("images", 10), async (req, res) => {
  const accessToken = getAccessToken(req.headers.authorization);
  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid Authorization header" },
    });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    });
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: { code: "VALIDATION_ERROR", message: "No images uploaded" } });
  }

  const client = getSupabaseClient(accessToken);
  const bucket = env.supabaseImageBucket;
  const uploads: { id: string; url: string }[] = [];

  for (const file of files) {
    const extension = path.extname(file.originalname) || `.${file.mimetype.split("/")[1]}`;
    const objectPath = `listings/${authData.user.id}/${randomUUID()}${extension}`;
    const { error } = await client.storage.from(bucket).upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      return res.status(500).json({
        success: false,
        error: { code: "UPLOAD_FAILED", message: error.message },
      });
    }

    const { data } = client.storage.from(bucket).getPublicUrl(objectPath);
    uploads.push({ id: objectPath, url: data.publicUrl });
  }

  return res.status(201).json({ success: true, data: uploads });
});
