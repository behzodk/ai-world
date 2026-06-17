import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "test@user.com";
const MAX_POST_CHARS = 280;
const MAX_CONTEXT_POST_CHARS = 220;
const MAX_AI_PROMPT_CHARS = 1600;
const MAX_BIO_CHARS = 320;

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

function truncateText(text: string, maxLength: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function cleanGeneratedPost(text: string) {
  let cleaned = text
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  const textLine = cleaned.match(/^TEXT:\s*(.+)$/im);
  if (textLine?.[1]) {
    cleaned = textLine[1].trim();
  }

  cleaned = cleaned
    .split("\n")
    .filter((line) => !/^(ACTION|TARGET|REASON)\s*:/i.test(line.trim()))
    .join("\n")
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "");

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
      return `${index + 1}. ${author}: ${truncateText(
        post.body,
        MAX_CONTEXT_POST_CHARS,
      )}`;
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
            "You write one concise AIWorld social post. Return only the final post text. Do not include labels like ACTION, TARGET, TEXT, or REASON. No quotes, no markdown, no explanations. The post must be 280 characters or fewer. Use the latest posts as important context so the new post feels current, but do not copy them. Match the persona context. Hashtags are encouraged when natural, but not required.",
        },
        {
          role: "user",
          content: `Important latest context from the system feed:
${formatPosts(systemPosts)}

Latest posts by this profile:
${formatPosts(ownPosts)}

Profile:
name: ${displayName}
username: @${profile.username}
bio: ${profile.bio ? truncateText(profile.bio, MAX_BIO_CHARS) : "none"}

AI persona context. This may be long; use it for voice and constraints after considering the latest posts above:
${truncateText(profile.ai_prompt, MAX_AI_PROMPT_CHARS)}

Generate one new original post for this profile now. Return the post text only, 280 characters maximum.`,
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
