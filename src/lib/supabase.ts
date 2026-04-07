import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key';

// Client for public/browser use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with service role (server-side only — full DB access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabaseAdmin;
