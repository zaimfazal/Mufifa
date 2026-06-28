import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Verify API Key / Authorization Header
    const authHeader = request.headers.get("authorization");
    const apiKey = request.headers.get("x-api-key");
    const expectedKey = process.env.AI_IG_API_KEY || "fallback_default_secret_key_123456";

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : apiKey;

    if (!token || token !== expectedKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or missing API authorization key.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse and Validate Request Body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Malformed JSON body.",
          },
        },
        { status: 400 }
      );
    }

    const { email, password } = body || {};

    if (!email || typeof email !== "string" || !email.trim() || !password || typeof password !== "string" || !password.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Email and password are required.",
          },
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 3. Authenticate with Supabase Auth (stateless)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Incorrect email or password.",
          },
        },
        { status: 401 }
      );
    }

    // 4. Fetch additional profile details using Admin Client to bypass RLS
    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, mulearn_id")
      .eq("id", authData.user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      email: authData.user.email,
      name: profile?.full_name || null,
      muid: profile?.mulearn_id || null,
    });
  } catch (error: any) {
    console.error("AI-IG API Authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "An unexpected error occurred.",
        },
      },
      { status: 500 }
    );
  }
}
