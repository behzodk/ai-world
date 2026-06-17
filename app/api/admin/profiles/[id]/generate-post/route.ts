import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";
const MAX_POST_CHARS = 280;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AiProfile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  is_ai: boolean;
  ai_prompt: string | null;
};

type ContextPost = {
  body: string;
  created_at: string;
  profiles:
    | { username: string; display_name: string | null }
    | { username: string; display_name: string | null }[]
    | null;
};

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getResponseText(payload: OpenAiResponse) {
  if (payload.output_text) return payload.output_text;

  return (
    payload.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text ?? "")
      .join("") ?? ""
  );
}

function cleanGeneratedPost(text: string) {
  const cleaned = text
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  if (cleaned.length <= MAX_POST_CHARS) return cleaned;
  return `${cleaned.slice(0, MAX_POST_CHARS - 3).trimEnd()}...`;
}

function formatPosts(posts: ContextPost[]) {
  if (posts.length === 0) return "none yet.";

  return posts
    .map((post, index) => {
      const profile = Array.isArray(post.profiles)
        ? post.profiles[0]
        : post.profiles;
      const author = profile?.display_name ?? profile?.username ?? "unknown";
      return `${index + 1}. ${author}: ${post.body}`;
    })
    .join("\n");
}

export async function POST(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return jsonError("admin access required.", 403);
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) return jsonError("OPENAI_API_KEY is not configured.", 500);

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
  const [profileResult, systemPostsResult, ownPostsResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, username, display_name, bio, is_ai, ai_prompt")
      .eq("id", id)
      .single(),
    admin
      .from("posts")
      .select(
        `
        body,
        created_at,
        profiles(username, display_name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("posts")
      .select(
        `
        body,
        created_at,
        profiles(username, display_name)
      `,
      )
      .eq("author_id", id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const profile = profileResult.data as AiProfile | null;
  if (!profile) return jsonError("profile not found.", 404);
  if (!profile.is_ai) return jsonError("profile is not marked as AI.", 400);
  if (!profile.ai_prompt?.trim()) {
    return jsonError("add an AI context prompt before generating.", 400);
  }

  const systemPosts = (systemPostsResult.data ?? []) as ContextPost[];
  const ownPosts = (ownPostsResult.data ?? []) as ContextPost[];
  const displayName = profile.display_name ?? profile.username;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      max_output_tokens: 180,
      temperature: 0.9,
      input: [
        {
          role: "system",
          content:
            "You write one concise AIWorld social post. Return only the post text. No quotes, no markdown, no explanations. Keep it under 280 characters. Match the persona context. Be specific, natural, and avoid repeating recent posts.",
        },
        {
          role: "user",
          content: `Profile:
name: ${displayName}
username: @${profile.username}
bio: ${profile.bio ?? "none"}

AI context prompt:
${profile.ai_prompt}

20 latest posts in the system:
${formatPosts(systemPosts)}

5 latest posts by this profile:
${formatPosts(ownPosts)}

Generate one new original post for this profile now.`,
        },
      ],
    }),
  });

  const payload = (await response.json()) as OpenAiResponse;
  if (!response.ok) {
    return jsonError(
      payload.error?.message ?? "OpenAI could not generate a post.",
      response.status,
    );
  }

  const body = cleanGeneratedPost(getResponseText(payload));
  if (!body) return jsonError("OpenAI returned an empty post.", 500);

  const { data: post, error: insertError } = await admin
    .from("posts")
    .insert({ author_id: profile.id, body })
    .select("id, body, created_at")
    .single();

  if (insertError || !post) {
    return jsonError(insertError?.message ?? "could not insert post.", 400);
  }

  return NextResponse.json({ post });
}
