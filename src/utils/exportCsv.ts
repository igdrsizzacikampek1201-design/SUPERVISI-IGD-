import { Nurse } from '../types';
import { normalizePK } from '../initialData';

export function exportNursesToCSV(nurses: Nurse[]): void {
  const headers = [
    'NO',
    'NIK',
    'NAMA',
    'TANGGAL MASUK',
    'PENDIDIKAN',
    'PERAWAT KLINIK',
    'STATUS KARYAWAN',
    'NO STR',
    'NO SIPP',
    'MASA AKTIF STR',
    'MASA AKTIF SIPP',
    'NO NIRA',
    'PELATIHAN'
  ];

  const rows = nurses.map(n => {
    const trainings = [...(n.pelatihan || []), n.pelatihanExtra].filter(Boolean).join('; ');
    return [
      `"${n.no || ''}"`,
      `"${n.nik || ''}"`,
      `"${n.nama}"`,
      `"${n.tanggalMasuk}"`,
      n.pendidikan,
      normalizePK(n.perawatKlinik),
      n.statusKaryawan,
      `"${n.noStr}"`,
      `"${n.noSipp}"`,
      `"${n.masaAktifStr}"`,
      `"${n.masaAktifSipp}"`,
      `"${n.noNira || ''}"`,
      `"${trainings}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Supervisi_IGD.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
