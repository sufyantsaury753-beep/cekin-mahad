const { createClient } = require('@supabase/supabase-js');
const url = 'https://kdzxuhlkvjyguelgqwzwb.supabase.co';
const key = 'sb_publishable_aWv_nn7ZFxIRltoIz0ojCw_hWJEzbAN';
const supabase = createClient(url, key);

async function test() {
  const { data: sk, error: skErr } = await supabase.from('sk_mahasantri').select('nim_nisn, nama').limit(10);
  console.log('SK count/sample:', sk?.length, sk, skErr);
}

test();
