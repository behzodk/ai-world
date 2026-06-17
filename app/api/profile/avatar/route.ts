import { NextResponse } from "next/server";
import { uploadProfileAvatar } from "@/lib/server/avatar-upload";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return jsonError("sign in to update your profile photo.", 401);

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "admin Supabase client is not configured.",
      500,
    );
  }

  const formData = await request.formData();
  const file = formData.get("avatar");
  const result = await uploadProfileAvatar({
    admin,
    profileId: user.id,
    file: file instanceof File ? file : null,
  });

  if (result.error) return jsonError(result.error, result.status);

  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { avatar_url: result.avatarUrl },
  });

  return NextResponse.json({ avatarUrl: result.avatarUrl });
}
