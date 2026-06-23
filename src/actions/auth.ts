'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const phone_number = formData.get('phone_number') as string
  const college = formData.get('college') as string
  const district = formData.get('district') as string
  const mulearn_id = (formData.get('mulearn_id') as string)?.trim()

  if (!mulearn_id || !mulearn_id.endsWith('@mulearn')) {
    return { error: 'muLearn ID is required and must end with "@mulearn".' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://mufifa-gules.vercel.app'
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name,
        phone_number,
        college,
        district,
        mulearn_id,
      }
    },
  })

  if (error) {
    console.error('[signUp] Supabase auth error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    const message = error.message && error.message !== '{}'
      ? error.message
      : 'Could not create your account. Please try again.'
    return { error: message }
  }

  // Next.js redirect needs to happen outside of try-catch/if blocks
  return { success: true }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[signIn] Supabase auth error:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    const message = error.message && error.message !== '{}'
      ? error.message
      : 'Could not sign you in. Please check your credentials and try again.'
    return { error: message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
