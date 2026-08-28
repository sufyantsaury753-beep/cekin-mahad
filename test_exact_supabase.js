const { createClient } = require('@supabase/supabase-js');
const url = 'https://kdzxuhlkvjyuelgqwzwb.supabase.co';
const key = 'sb_publishable_aWv_nn7ZFxIRltoIz0ojCw_hWJEzbAN';
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('sk_mahasantri').select('*').limit(5);
  console.log('SK test result:', { count: data?.length, data, error });
}

test();
