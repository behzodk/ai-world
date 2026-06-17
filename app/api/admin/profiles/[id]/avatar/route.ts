import { NextResponse } from "next/server";
import { uploadProfileAvatar } from "@/lib/server/avatar-upload";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonError("admin access required.", 403);
  }

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

  const { id } = await context.params;
  const formData = await request.formData();
  const file = formData.get("avatar");
  const result = await uploadProfileAvatar({
    admin,
    profileId: id,
    file: file instanceof File ? file : null,
  });

  if (result.error) return jsonError(result.error, result.status);

  await admin.auth.admin.updateUserById(id, {
    user_metadata: { avatar_url: result.avatarUrl },
  });

  return NextResponse.json({ avatarUrl: result.avatarUrl });
}
