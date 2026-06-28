"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signIn(formData: FormData) {
  const username = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Email/muLearn ID and password are required." };
  }

  const host = (await headers()).get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const apiUrl = `${protocol}://${host}/api/v1/ai-ig/auth`;

  try {
    // 1. Authenticate with the external API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_IG_API_KEY || "fallback_default_secret_key_123456"}`
      },
      body: JSON.stringify({
        email: username,
        password: password,
      }),
    });

    if (!response.ok) {
      let errorMsg = "Invalid credentials or authentication failed.";
      try {
        const errData = await response.json();
        if (errData.message) {
          errorMsg = errData.message;
        } else if (errData.error) {
          if (typeof errData.error === "string") {
            errorMsg = errData.error;
          } else if (typeof errData.error === "object" && errData.error !== null) {
            errorMsg = errData.error.message || errData.error.code || errorMsg;
          }
        }
      } catch {}
      return { error: errorMsg };
    }

    const data = await response.json();

    // 2. Extract values defensively
    const email = data.email || data.data?.email || data.user?.email;
    const name = data.name || data.data?.name || data.user?.name;
    const muid = data.muid || data.data?.muid || data.user?.muid;

    if (!email) {
      return {
        error:
          "Authentication succeeded, but no email was returned from the server.",
      };
    }

    const adminClient = createAdminClient();

    // 3. Find if a profile with this email already exists in Supabase
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.id;

      // Sync/update password and user metadata in Supabase Auth
      const { error: updateError } =
        await adminClient.auth.admin.updateUserById(userId, {
          password,
          user_metadata: {
            full_name: name,
            mulearn_id: muid,
          },
        });
      if (updateError) {
        console.error(
          "Error updating existing Supabase user auth:",
          updateError,
        );
      }

      // Update public.profiles fields to ensure sync
      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          full_name: name,
          mulearn_id: muid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileUpdateError) {
        console.error("Error updating profile table:", profileUpdateError);
      }
    } else {
      // User doesn't exist in Supabase, create them
      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            mulearn_id: muid,
          },
        });

      if (createError || !newUser?.user) {
        console.error("Error creating new Supabase user:", createError);
        return {
          error: createError?.message || "Failed to initialize your session.",
        };
      }
      userId = newUser.user.id;

      // Standard trigger inserts basic profile details, but let's update profile table directly
      // to ensure full_name and mulearn_id are written.
      const { error: profileUpdateError } = await adminClient
        .from("profiles")
        .update({
          full_name: name,
          mulearn_id: muid,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileUpdateError) {
        console.error(
          "Error updating profile table for new user:",
          profileUpdateError,
        );
      }
    }

    // 4. Log the user in on the client side using Supabase Auth client to set session cookies
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error(
        "Error signing in to Supabase with synced password:",
        signInError,
      );
      return { error: signInError.message };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred during login.";
    console.error("Authentication process failed:", err);
    return {
      error: errorMsg,
    };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
