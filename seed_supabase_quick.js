const { createClient } = require('@supabase/supabase-js');
const url = 'https://kdzxuhlkvjyuelgqwzwb.supabase.co';
const key = 'sb_publishable_aWv_nn7ZFxIRltoIz0ojCw_hWJEzbAN';
const supabase = createClient(url, key);

async function seed() {
  console.log('Seeding data to Supabase...');

  // 1. Seed SK Mahasantri
  const skList = [
    {
      nim_nisn: '2530104044',
      no: 1,
      nama: 'Muhammad Indera Wiguna',
      jenis_kelamin: 'L',
      jenis_pendaftaran: 'Perpanjangan',
      fakultas: 'FITK',
      jurusan: 'TIPS',
      is_internasional: false,
      sk_nomor: 'SK-01/2026'
    },
    {
      nim_nisn: '0067999651',
      no: 4,
      nama: 'Abdullah Al Mu\'izi Mafas',
      jenis_kelamin: 'L',
      jenis_pendaftaran: 'Calon Mahasantri Baru',
      fakultas: 'FASYA',
      jurusan: 'HKI',
      is_internasional: false,
      sk_nomor: 'SK-01/2026'
    },
    {
      nim_nisn: '0074324633',
      no: 5,
      nama: 'Abdullah Fasya',
      jenis_kelamin: 'L',
      jenis_pendaftaran: 'Calon Mahasantri Baru',
      fakultas: 'FITK',
      jurusan: 'PAI',
      is_internasional: false,
      sk_nomor: 'SK-01/2026'
    }
  ];

  const { data: skRes, error: skErr } = await supabase.from('sk_mahasantri').upsert(skList);
  console.log('SK Seed:', { skRes, skErr });

  // 2. Check 2530104044
  const { data: verify, error: vErr } = await supabase.from('sk_mahasantri').select('*').eq('nim_nisn', '2530104044');
  console.log('Verified Indera Wiguna in Supabase:', verify, vErr);
}

seed();
