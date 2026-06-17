import type { SupabaseClient } from "@supabase/supabase-js";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type AvatarUploadResult =
  | { avatarUrl: string; error?: never }
  | { avatarUrl?: never; error: string; status: number };

async function ensureAvatarBucket(admin: SupabaseClient) {
  const { error } = await admin.storage.getBucket(AVATAR_BUCKET);
  if (!error) return null;

  const { error: createError } = await admin.storage.createBucket(
    AVATAR_BUCKET,
    {
      public: true,
      fileSizeLimit: MAX_AVATAR_BYTES,
      allowedMimeTypes: Object.keys(IMAGE_EXTENSIONS),
    },
  );

  return createError;
}

export async function uploadProfileAvatar({
  admin,
  profileId,
  file,
}: {
  admin: SupabaseClient;
  profileId: string;
  file: File | null;
}): Promise<AvatarUploadResult> {
  if (!file || file.size === 0) {
    return { error: "choose an image file.", status: 400 };
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return { error: "avatar must be a jpg, png, webp, or gif.", status: 400 };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "avatar must be smaller than 5MB.", status: 400 };
  }

  const bucketError = await ensureAvatarBucket(admin);
  if (bucketError) {
    return { error: bucketError.message, status: 500 };
  }

  const objectPath = `${profileId}/avatar-${Date.now()}.${extension}`;
  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, status: 400 };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);

  const { error: updateError } = await admin
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", profileId);

  if (updateError) {
    return { error: updateError.message, status: 400 };
  }

  return { avatarUrl: publicUrl };
}
