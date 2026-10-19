import { createClient } from '@supabase/supabase-js';

function getStoredSupabaseConfig() {
  try {
    const customUrl = localStorage.getItem('custom_supabase_url');
    const customKey = localStorage.getItem('custom_supabase_anon_key');
    if (customUrl && customKey) {
      return { url: customUrl, key: customKey };
    }
  } catch {}

  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseUrl = (!rawUrl || rawUrl.includes('YOUR_SUPABASE_PROJECT_URL')) 
    ? 'https://fcgzargsezyykdrqcrrn.supabase.co' 
    : rawUrl;

  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabaseAnonKey = (!rawKey || rawKey.includes('YOUR_SUPABASE_ANON_KEY'))
    ? 'sb_publishable_oaT0DWnQUHfO83OrfTLDrg_W-M0yuXm'
    : rawKey;
  
  return { url: supabaseUrl, key: supabaseAnonKey };
}

const config = getStoredSupabaseConfig();
export const supabase = config.url && config.key ? createClient(config.url, config.key) : null;

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
