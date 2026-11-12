import { Nurse, SupervisiIndicator, SupervisiLog } from './types';

export const DEFAULT_TRAININGS: string[] = [
  'BTCLS',
  'Triase IGD',
  'Code Blue / ACLS',
  'PPI',
  'Manajemen Nyeri'
];

export const DEFAULT_SUPERVISI_INDICATORS: SupervisiIndicator[] = [
  {
    id: 'ind-1',
    title: 'Ketepatan Triase Pasien Masuk IGD (ESI / ATS)',
    category: 'SPO Triase IGD',
    guide: '1. Lakukan primary survey visual (ABC) dalam <2 menit. 2. Tentukan level kegawatan (Merah/Kuning/Hijau) sesuai skala ESI/ATS. 3. Arahkan pasien ke zona resusitasi/observasi yang tepat dan catat jam datang vs jam triase.'
  },
  {
    id: 'ind-2',
    title: 'Penanganan Kegawatdaruratan & Resusitasi (ABCDE)',
    category: 'SPO Resusitasi',
    guide: '1. Pastikan patensi jalan napas (Airway) & kontrol servikal bila trauma. 2. Evaluasi pernapasan (Breathing) & berikan oksigenasi adekuat. 3. Pasang akses IV line besar (Circulation), monitor EKG, dan siapkan troli emergensi/defibrilator.'
  },
  {
    id: 'ind-3',
    title: 'Kepatuhan Kebersihan Tangan & Penggunaan APD (PPI)',
    category: 'Standar PPI',
    guide: '1. Terapkan 5 Momen Cuci Tangan (sebelum/sesudah kontak pasien, tindakan aseptik, cairan tubuh, lingkungan pasien). 2. Gunakan APD sesuai level paparan (sarung tangan, masker bedah/N95, apron) dan buang limbah infeksius ke tempat medis.'
  },
  {
    id: 'ind-4',
    title: 'Keamanan Pemberian Obat High Alert & Emergensi',
    category: 'Sasaran Keselamatan Pasien (SKP 3)',
    guide: '1. Lakukan prinsip 7 Benar obat. 2. Lakukan Double Check dengan perawat lain sebelum memberikan obat High Alert (epinefrin, amiodaron, KCl, insulin, narkotika). 3. Tempelkan stiker High Alert pada cairan/spuit dan pantau efek samping.'
  },
  {
    id: 'ind-5',
    title: 'Komunikasi Efektif SBAR & Timbang Terima Shift',
    category: 'Sasaran Keselamatan Pasien (SKP 2)',
    guide: '1. Susun laporan kondisi kritis ke DPJP menggunakan format Situation, Background, Assessment, Recommendation (SBAR). 2. Lakukan Write-Back & Read-Back untuk instruksi verbal/telepon dan mintakan verifikasi tanda tangan DPJP dalam 1x24 jam.'
  },
  {
    id: 'ind-6',
    title: 'Kelengkapan Dokumentasi Asuhan Keperawatan IGD',
    category: 'SPO Rekam Medis IGD',
    guide: '1. Lengkapi pengkajian awal keperawatan IGD, skala nyeri, dan risiko jatuh. 2. Catat seluruh tindakan invasif, balans cairan, serta evaluasi kondisi pasien sebelum pindah rawat inap atau pulang.'
  }
];

export const INITIAL_NURSES_DATA: Nurse[] = [
  {
    id: 'nurse-1',
    no: '1',
    nik: '150201053',
    nama: 'Ns. Ogi Gupron, S.Kep',
    tanggalMasuk: '02/02/2015',
    pendidikan: 'S1',
    perawatKlinik: 'PK 2',
    statusKaryawan: 'KARTAP',
    noStr: 'XO00001677850480',
    noSipp: '503/3900/1009/SIP.P/V/DPMPTSP/2026',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '20/05/2031',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'Code Blue / ACLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-2',
    no: '2',
    nik: '161101181',
    nama: 'Ns. Trias Yuniardi, S. Kep',
    tanggalMasuk: '21/11/2016',
    pendidikan: 'S1',
    perawatKlinik: 'PK 2',
    statusKaryawan: 'KARTAP',
    noStr: '130171117-2139273',
    noSipp: '503/10645/493/SIK.P/XI/DPMPTSP/2018',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '22/11/2022',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-3',
    no: '3',
    nik: '260801841',
    nama: 'Ns Melatifah Rizqonida, S. Kep',
    tanggalMasuk: '20/08/2026',
    pendidikan: 'S1',
    perawatKlinik: 'PRA PK',
    statusKaryawan: 'PKWT',
    noStr: 'NV00002141028788',
    noSipp: '503/6830/1681/SIP.P/IX/DPMPTSP/2026',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '14/09/2031',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-4',
    no: '',
    nik: '',
    nama: 'Ns. Tris Abdul Azis, S. Kep',
    tanggalMasuk: '04/10/2023',
    pendidikan: 'S1',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'KARTAP',
    noStr: '130171121-3406966',
    noSipp: '503/2101/526/SIP.P/VI/DPMPTSP/2023',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '23/04/2026',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-5',
    no: '4',
    nik: '240701706',
    nama: 'Ade Sugih A. Md. Kep',
    tanggalMasuk: '17/07/2024',
    pendidikan: 'D3',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'PKWT',
    noStr: '0433151440120230036',
    noSipp: '503/5904/1266/SIP.P/XI/DPMPTSP/2024',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '30/07/2029',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-6',
    no: '5',
    nik: '160701094',
    nama: 'Ns. Cepi Haerudin, S. Kep',
    tanggalMasuk: 'BLM ADA',
    pendidikan: 'S1',
    perawatKlinik: 'PK 2',
    statusKaryawan: 'KARTAP',
    noStr: '130151118-2349741',
    noSipp: '503/7720/1850/SIP.P/VII/DPMPTSP/2026',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '18/02/2032',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'Code Blue / ACLS', 'PPI', 'Manajemen Nyeri'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-7',
    no: '6',
    nik: '240801712',
    nama: 'Shyski Al Sedes, Amd. Kep',
    tanggalMasuk: '05/08/2024',
    pendidikan: 'D3',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'PKWT',
    noStr: '0433131440120180064',
    noSipp: '503/4666/776/SIP.P/VII/DPMPTSP/2025',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '02/01/2030',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-8',
    no: '7',
    nik: '241201748',
    nama: 'Ns. Maharani Shalma Rosalina, S Kep',
    tanggalMasuk: '23/12/2024',
    pendidikan: 'S1',
    perawatKlinik: 'PRA PK',
    statusKaryawan: 'PKWT',
    noStr: 'LI00001596966233',
    noSipp: '503/724/146/SIP.P/II/DPMPTSP/2025',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '06/02/2030',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-9',
    no: '8',
    nik: '251001771',
    nama: 'Ns Fauzi Noor Rochman, S. Kep',
    tanggalMasuk: 'BLM ADA',
    pendidikan: 'S1',
    perawatKlinik: 'PRA PK',
    statusKaryawan: 'PKWT',
    noStr: 'FU00001879518963',
    noSipp: '503/7839/1313/SIP.P/XI/DPMPTSP/2025',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '10/11/2030',
    noNira: '',
    pelatihan: ['BTCLS'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-10',
    no: '9',
    nik: '170801235',
    nama: 'Lurgianto Septadi, Amd. Kep',
    tanggalMasuk: '17/08/2017',
    pendidikan: 'D3',
    perawatKlinik: 'PK 2',
    statusKaryawan: 'KARTAP',
    noStr: 'YT00000935867816',
    noSipp: '503/5309/1126/SIP.P/X/DPMPTSP/2024',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '09/04/2029',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'PPI', 'Manajemen Nyeri'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-11',
    no: '10',
    nik: '240301676',
    nama: 'Ns Adam Maulid Alfarisi, S. Kep',
    tanggalMasuk: '26/03/2024',
    pendidikan: 'S1',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'PKWT',
    noStr: 'FI00000810596886',
    noSipp: '503/72/33/SIP.P/I/DPMPTSP/2025',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '29/07/2029',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-12',
    no: '11',
    nik: '240601697',
    nama: 'Adrina Nurmala, Amd. Kep',
    tanggalMasuk: '06/06/2024',
    pendidikan: 'D3',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'KARTAP',
    noStr: '130152223-4771514',
    noSipp: '503/4667/961/SIP.P/IX/DPMPTSP/2024',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '11/01/2028',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-13',
    no: '12',
    nik: '260901850',
    nama: 'Ns Ngasriatin edoh wulantika, Amd, Kep',
    tanggalMasuk: '02/09/2026',
    pendidikan: 'S1',
    perawatKlinik: 'PRA PK',
    statusKaryawan: 'PKWT',
    noStr: 'AR00002002455767',
    noSipp: '503/7724/1854/SIP.P/X/DPMPTSP/2026',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '09/10/2031',
    noNira: '',
    pelatihan: ['BTCLS'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-14',
    no: '13',
    nik: '160801102',
    nama: 'Wildan Hadiansyah, Amd. Kep',
    tanggalMasuk: '16/08/2026',
    pendidikan: 'D3',
    perawatKlinik: 'PK 2',
    statusKaryawan: 'KARTAP',
    noStr: '130151220-3186965',
    noSipp: '503/6921/1150/SIP.P/VII/DPMPTSP/2025',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '28/10/2030',
    noNira: '',
    pelatihan: ['BTCLS', 'Triase IGD', 'Code Blue / ACLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-15',
    no: '14',
    nik: '240701705',
    nama: 'Ns Sisca Damayanti, S. Kep',
    tanggalMasuk: '12/07/2024',
    pendidikan: 'S1',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'PKWT',
    noStr: 'EK00000167689651',
    noSipp: '503/5655/1214/SIP.P/XI/DPMPTSP/2024',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '14/07/2029',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI', 'Manajemen Nyeri'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-16',
    no: '15',
    nik: '241101731',
    nama: 'Taufik Jati Kuncoro, Amd. Kep',
    tanggalMasuk: '04/11/2024',
    pendidikan: 'D3',
    perawatKlinik: 'PK 1',
    statusKaryawan: 'PKWT',
    noStr: 'DU00001606334328',
    noSipp: '503/6233/1315/SIP.PLXII/DPMPTSP/2024',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '03/07/2029',
    noNira: '',
    pelatihan: ['BTCLS', 'PPI'],
    pelatihanExtra: ''
  },
  {
    id: 'nurse-17',
    no: '16',
    nik: '260501808',
    nama: 'Moch Rofiul Awal, Amd. Kep',
    tanggalMasuk: '05/05/2026',
    pendidikan: 'D3',
    perawatKlinik: 'PRA PK',
    statusKaryawan: 'PKWT',
    noStr: 'GO00002115791595',
    noSipp: '503/5724/1430/SIP.P/VIII/DPMPTSP/2026',
    masaAktifStr: 'SEUMUR HIDUP',
    masaAktifSipp: '27/05/2027',
    noNira: '',
    pelatihan: ['BTCLS'],
    pelatihanExtra: ''
  }
];

export const INITIAL_SUPERVISI_LOGS: SupervisiLog[] = [
  {
    id: 'sup-init-1',
    nurseId: 'nurse-1',
    nurseName: 'Ns. Ogi Gupron, S.Kep',
    nursePk: 'PK 2',
    supervisor: 'Kepala Ruangan IGD',
    date: '2026-11-10',
    shift: 'Pagi (07.00 - 14.00)',
    itemsSnapshot: [
      { title: 'Ketepatan Triase Pasien Masuk IGD (ESI / ATS)', score: 2 },
      { title: 'Penanganan Kegawatdaruratan & Resusitasi (ABCDE)', score: 2 },
      { title: 'Kepatuhan Kebersihan Tangan & Penggunaan APD (PPI)', score: 2 },
      { title: 'Keamanan Pemberian Obat High Alert & Emergensi', score: 2 },
      { title: 'Komunikasi Efektif SBAR & Timbang Terima Shift', score: 2 },
      { title: 'Kelengkapan Dokumentasi Asuhan Keperawatan IGD', score: 2 }
    ],
    totalScore: 12,
    maxScore: 12,
    percentage: 100,
    category: 'Kompeten',
    notes: 'Mampu memimpin tim resusitasi pasien trauma dengan sangat sigap, komunikasi SBAR ke DPJP Bedah sangat jelas.'
  }
];

export function normalizePK(pk?: string): string {
  if (!pk) return 'PRA PK';
  const upper = pk.toUpperCase().trim();
  if (upper === 'PK1' || upper === 'PK 1') return 'PK 1';
  if (upper === 'PK2' || upper === 'PK 2') return 'PK 2';
  if (upper === 'PK3' || upper === 'PK 3') return 'PK 3';
  if (upper === 'PRA PK' || upper === 'PRAPK') return 'PRA PK';
  return upper;
}
