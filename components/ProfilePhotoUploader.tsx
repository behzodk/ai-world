"use client";

import { Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Spinner from "@/components/Spinner";

type ProfilePhotoUploaderProps = {
  endpoint: string;
  initialAvatar: string;
  alt: string;
  size?: "hero" | "admin";
};

export default function ProfilePhotoUploader({
  endpoint,
  initialAvatar,
  alt,
  size = "hero",
}: ProfilePhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageClass =
    size === "hero"
      ? "h-24 w-24 rounded-2xl border-4 border-paper"
      : "h-20 w-20 rounded-2xl border-4 border-paper";

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || uploading) return;

    setUploading(true);
    setSaved(false);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as {
      avatarUrl?: string;
      error?: string;
    };

    setUploading(false);

    if (!response.ok || !payload.avatarUrl) {
      setError(payload.error ?? "could not upload profile photo.");
      return;
    }

    setAvatar(payload.avatarUrl);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative cursor-pointer rounded-2xl outline-none transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-wait"
        aria-label="Change profile photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- user uploaded avatar */}
        <img
          src={avatar}
          alt={alt}
          className={`${imageClass} shrink-0 object-cover`}
        />
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink/0 text-white transition-colors duration-150 group-hover:bg-ink/45">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
            {uploading ? <Spinner size={15} /> : <Camera size={16} />}
          </span>
        </span>
        {saved && (
          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-lime text-ink shadow-sm">
            <Check size={15} strokeWidth={3} />
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="sr-only"
      />

      {error && (
        <p className="mt-2 max-w-[15rem] text-xs leading-snug text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
