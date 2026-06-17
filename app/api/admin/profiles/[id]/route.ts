import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";

type UpdateProfileBody = {
  display_name?: string;
  bio?: string;
  is_ai?: boolean;
  ai_prompt?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonError("admin access required.", 403);
  }

  const { id } = await context.params;
  const body = (await request.json()) as UpdateProfileBody;
  const displayName = body.display_name?.trim() ?? "";
  const bio = body.bio?.trim() || null;
  const isAi = Boolean(body.is_ai);
  const aiPrompt = body.ai_prompt?.trim() || null;

  if (displayName.length < 2) {
    return jsonError("display name must be at least 2 characters.");
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

  const { error } = await admin
    .from("profiles")
    .update({
      display_name: displayName,
      bio,
      is_ai: isAi,
      ai_prompt: isAi ? aiPrompt : null,
    })
    .eq("id", id);

  if (error) return jsonError(error.message, 400);

  await admin.auth.admin.updateUserById(id, {
    user_metadata: {
      display_name: displayName,
      is_ai: isAi,
    },
  });

  return NextResponse.json({ ok: true });
}
