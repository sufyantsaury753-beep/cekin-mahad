const { createClient } = require('@supabase/supabase-js');
const url = 'https://kdzxuhlkvjyuelgqwzwb.supabase.co';
const key = 'sb_publishable_aWv_nn7ZFxIRltoIz0ojCw_hWJEzbAN';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('sk_pengurus').select('*');
  console.log('sk_pengurus in Supabase:', data, error);
}

check();
