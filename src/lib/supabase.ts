import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public/browser use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role (server-side only — full DB access)
// We add a fallback to prevent Next.js from throwing errors when attempting to bundle this file for the frontend browser!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'dummy-key');

export default supabaseAdmin;
