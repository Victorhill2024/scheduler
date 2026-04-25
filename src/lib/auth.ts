/**
 * Auth helpers wrapping Supabase Auth.
 *
 * The dashboard requires an authenticated user. Use `getCurrentUser()`
 * inside Server Components / Route Handlers to gate access.
 */

import type { User } from "@supabase/supabase-js";

import { browserClient, serverClient } from "./supabase";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = browserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = browserClient();
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  const supabase = browserClient();
  await supabase.auth.signOut();
}
