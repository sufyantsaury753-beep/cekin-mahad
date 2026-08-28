const { createClient } = require('@supabase/supabase-js');
const url = 'https://kdzxuhlkvjyuelgqwzwb.supabase.co';
const key = 'sb_publishable_aWv_nn7ZFxIRltoIz0ojCw_hWJEzbAN';
const supabase = createClient(url, key);

async function seedPgr() {
  const raihan = {
    id: 'SKP-JD-0653',
    nama: 'Raihan',
    nim: '2530311000',
    jenis_kelamin: 'L',
    jabatan: 'Mudabbir Lantai',
    gedung: "Ma'had Jadid",
    lantai: 5,
    kamar_khusus: '510',
    no_wa: '081234567899',
    password: 'bedahbalong',
    is_aktif: true,
    sk_nomor: 'SK-PENGURUS/2026'
  };

  await supabase.from('sk_pengurus').delete().neq('id', 'xyz');
  const { data, error } = await supabase.from('sk_pengurus').upsert([raihan]);
  console.log('Inserted Raihan to Supabase:', { data, error });

  const { data: list } = await supabase.from('sk_pengurus').select('*');
  console.log('Current sk_pengurus in Supabase:', list);
}

seedPgr();
