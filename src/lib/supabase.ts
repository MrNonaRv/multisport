import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Image storage will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function testSupabaseConnection() {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  try {
    // listBuckets() requires service_role/admin rights. Use bucket listing instead.
    const { data, error } = await supabase.storage.from('athlete-images').list('', { limit: 1 });
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
