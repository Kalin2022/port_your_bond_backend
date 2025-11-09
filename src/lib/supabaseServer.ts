// src/lib/supabaseServer.ts
// Centralized server-side Supabase client using the service role key.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const sb = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
