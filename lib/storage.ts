// Storage layer: swap these 3 functions to move to S3 / R2 / Cloudinary.
import { db } from "./db";
export const bucketFor = (k: "video" | "thumb") => (k === "video" ? "videos" : "thumbnails");
export async function signedUpload(kind: "video" | "thumb", path: string) {
  const { data, error } = await db.storage.from(bucketFor(kind)).createSignedUploadUrl(path);
  if (error) throw error; return data.signedUrl;
}
export async function signedRead(path: string, secs = 3600, downloadName?: string) {
  const { data } = await db.storage.from("videos").createSignedUrl(path, secs, downloadName ? { download: downloadName } : undefined);
  return data?.signedUrl;
}
export const thumbUrl = (p?: string | null) => (p ? db.storage.from("thumbnails").getPublicUrl(p).data.publicUrl : "");
export async function removeFiles(v?: string, t?: string) {
  if (v) await db.storage.from("videos").remove([v]); if (t) await db.storage.from("thumbnails").remove([t]);
}
