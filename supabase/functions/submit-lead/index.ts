import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

function allowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ??
    "http://localhost:8080,http://127.0.0.1:8080,https://vtechfacades.com";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = allowedOrigins();
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(status: number, body: unknown, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" }, origin);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" }, origin);
  }

  // Honeypot: pretend success so bots do not learn the field is ignored.
  if (asString(payload.company) || asString(payload.website)) {
    return json(201, { ok: true }, origin);
  }

  const name = asString(payload.name);
  const phone = asString(payload.phone);
  const email = asString(payload.email).toLowerCase();
  const message = asString(payload.message);
  const categorySlug = asString(payload.category_slug);
  const sourcePath = asString(payload.source_path).slice(0, 200);
  const sourceCta = asString(payload.source_cta).slice(0, 40);
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 400);

  if (!name || !phone || !email || !categorySlug) {
    return json(400, { error: "Name, phone, email, and category are required." }, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { error: "A valid email is required." }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: "Server is not configured." }, origin);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, slug, label, is_active")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    return json(500, { error: "Could not verify category." }, origin);
  }
  if (!category) {
    return json(400, { error: "Choose an active category." }, origin);
  }

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data: recent } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .eq("phone", phone)
    .gte("created_at", since)
    .limit(1);

  if (recent && recent.length > 0) {
    return json(429, { error: "This enquiry was already received. We will be in touch." }, origin);
  }

  const { error: insertError } = await supabase.from("leads").insert({
    name,
    phone,
    email,
    message: message || null,
    category_id: category.id,
    category_slug: category.slug,
    category_label: category.label,
    status: "new",
    source_path: sourcePath || null,
    source_cta: sourceCta || null,
    user_agent: userAgent || null,
  });

  if (insertError) {
    return json(500, { error: "Could not save the enquiry." }, origin);
  }

  const webhook = Deno.env.get("LEAD_NOTIFY_WEBHOOK");
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          message,
          category: category.label,
          source_path: sourcePath,
        }),
      });
    } catch {
      // Lead is stored; notification failure must not fail the request.
    }
  }

  return json(201, { ok: true }, origin);
});
