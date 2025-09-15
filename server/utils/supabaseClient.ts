import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function insertJobRecord({
  job_id,
  user_email,
  status,
  result_path,
  result_url,
  completed_at,
  raw_output_json,
  error_message,
}: {
  job_id: string;
  user_email: string;
  status: string;
  result_path?: string;
  result_url?: string;
  completed_at?: string;
  raw_output_json?: any;
  error_message?: string;
}) {
  try {
    const { error } = await supabase.from('job_results').insert({
      job_id,
      user_email,
      status,
      result_path,
      result_url,
      completed_at,
      raw_output_json,
      error_message,
    });

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
    } else {
      console.log('📡 Supabase: Job record inserted');
    }
  } catch (e) {
    console.error('❌ Supabase insert exception:', e);
  }
}


