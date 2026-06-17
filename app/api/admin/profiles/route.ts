import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  validateEmail,
  validatePassword,
  validateUsernameFormat,
} from "@/lib/validation";

const ADMIN_EMAIL = "test@user.com";

type CreateProfileBody = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  bio?: string;
  is_ai?: boolean;
  ai_prompt?: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonError("admin access required.", 403);
  }

  const body = (await request.json()) as CreateProfileBody;
  const name = body.name?.trim() ?? "";
  const username = body.username?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const bio = body.bio?.trim() || null;
  const isAi = Boolean(body.is_ai);
  const aiPrompt = body.ai_prompt?.trim() || null;

  if (name.length < 2) return jsonError("name is required.");
  if (!validateUsernameFormat(username)) return jsonError("username is invalid.");
  if (!validateEmail(email)) return jsonError("email is invalid.");
  if (!validatePassword(password)) {
    return jsonError("password must be at least 8 characters.");
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

  const { data: existingUsername } = await admin
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .limit(1);

  if (existingUsername && existingUsername.length > 0) {
    return jsonError("that username is already taken.", 409);
  }

  const [firstName = "", ...restName] = name.split(/\s+/);
  const lastName = restName.join(" ");

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        display_name: name,
        first_name: firstName,
        last_name: lastName,
        is_ai: isAi,
      },
    });

  if (createError || !created.user) {
    return jsonError(createError?.message ?? "could not create user.", 400);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    username,
    display_name: name,
    avatar_url: null,
    bio,
    is_ai: isAi,
    ai_prompt: isAi ? aiPrompt : null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return jsonError(profileError.message, 400);
  }

  return NextResponse.json({
    user: {
      id: created.user.id,
      email: created.user.email,
      username,
      display_name: name,
      is_ai: isAi,
    },
  });
}
