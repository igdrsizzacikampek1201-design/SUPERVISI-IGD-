export interface Nurse {
  id: string;
  no: string;
  nik: string;
  nama: string;
  tanggalMasuk: string;
  pendidikan: 'S1' | 'D3' | string;
  perawatKlinik: string; // e.g. 'PK 1', 'PK 2', 'PRA PK'
  statusKaryawan: 'KARTAP' | 'PKWT' | string;
  noStr: string;
  noSipp: string;
  masaAktifStr: string;
  masaAktifSipp: string;
  noNira: string;
  pelatihan: string[];
  pelatihanExtra?: string;
}

export interface SupervisiIndicator {
  id: string;
  title: string;
  category: string;
  guide: string;
}

export interface SupervisiScoreItem {
  title: string;
  category?: string;
  score: number; // 2, 1, or 0
}

export interface SupervisiLog {
  id: string;
  nurseId: string;
  nurseName: string;
  nursePk: string;
  supervisor: string;
  date: string;
  shift: string;
  itemsSnapshot: SupervisiScoreItem[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  category: string; // 'Kompeten' | 'Perlu Bimbingan' | 'Perlu Latihan Ulang'
  notes: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'danger';
}
