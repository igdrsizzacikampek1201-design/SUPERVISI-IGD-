import React, { useState, useEffect } from 'react';
import { Nurse } from '../../types';
import { normalizePK } from '../../initialData';

interface NurseModalProps {
  isOpen: boolean;
  nurse: Nurse | null;
  trainings: string[];
  totalNurses: number;
  onClose: () => void;
  onSave: (nurse: Nurse) => void;
}

export const NurseModal: React.FC<NurseModalProps> = ({
  isOpen,
  nurse,
  trainings,
  totalNurses,
  onClose,
  onSave
}) => {
  const [no, setNo] = useState('');
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tanggalMasuk, setTanggalMasuk] = useState('');
  const [pendidikan, setPendidikan] = useState<'S1' | 'D3' | string>('S1');
  const [perawatKlinik, setPerawatKlinik] = useState('PK 1');
  const [statusKaryawan, setStatusKaryawan] = useState<'KARTAP' | 'PKWT' | string>('PKWT');
  const [noStr, setNoStr] = useState('');
  const [masaAktifStr, setMasaAktifStr] = useState('SEUMUR HIDUP');
  const [noSipp, setNoSipp] = useState('');
  const [masaAktifSipp, setMasaAktifSipp] = useState('');
  const [noNira, setNoNira] = useState('');
  const [pelatihanExtra, setPelatihanExtra] = useState('');
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);

  useEffect(() => {
    if (nurse) {
      setNo(nurse.no || '');
      setNik(nurse.nik || '');
      setNama(nurse.nama || '');
      setTanggalMasuk(nurse.tanggalMasuk || '');
      setPendidikan(nurse.pendidikan || 'S1');
      setPerawatKlinik(normalizePK(nurse.perawatKlinik));
      setStatusKaryawan(nurse.statusKaryawan || 'PKWT');
      setNoStr(nurse.noStr || '');
      setMasaAktifStr(nurse.masaAktifStr || 'SEUMUR HIDUP');
      setNoSipp(nurse.noSipp || '');
      setMasaAktifSipp(nurse.masaAktifSipp || '');
      setNoNira(nurse.noNira || '');
      setPelatihanExtra(nurse.pelatihanExtra || '');
      setSelectedTrainings(Array.isArray(nurse.pelatihan) ? [...nurse.pelatihan] : []);
    } else {
      setNo(String(totalNurses + 1));
      setNik('');
      setNama('');
      setTanggalMasuk('');
      setPendidikan('S1');
      setPerawatKlinik('PRA PK');
      setStatusKaryawan('PKWT');
      setNoStr('');
      setMasaAktifStr('SEUMUR HIDUP');
      setNoSipp('');
      setMasaAktifSipp('');
      setNoNira('');
      setPelatihanExtra('');
      setSelectedTrainings([]);
    }
  }, [nurse, totalNurses, isOpen]);

  if (!isOpen) return null;

  const toggleTraining = (tr: string) => {
    if (selectedTrainings.includes(tr)) {
      setSelectedTrainings(selectedTrainings.filter(t => t !== tr));
    } else {
      setSelectedTrainings([...selectedTrainings, tr]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const payload: Nurse = {
      id: nurse?.id || `nurse-${Date.now()}`,
      no: no.trim(),
      nik: nik.trim(),
      nama: nama.trim(),
      tanggalMasuk: tanggalMasuk.trim() || 'BLM ADA',
      pendidikan,
      perawatKlinik,
      statusKaryawan,
      noStr: noStr.trim() || '-',
      masaAktifStr: masaAktifStr.trim() || 'SEUMUR HIDUP',
      noSipp: noSipp.trim() || '-',
      masaAktifSipp: masaAktifSipp.trim() || '-',
      noNira: noNira.trim(),
      pelatihan: selectedTrainings,
      pelatihanExtra: pelatihanExtra.trim()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-user-nurse text-emerald-300"></i>
            <h3 className="text-base font-bold">
              {nurse ? 'Edit Data & Kredensial Perawat IGD' : 'Tambah Perawat IGD Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Urut (NO)
              </label>
              <input
                type="text"
                value={no}
                onChange={e => setNo(e.target.value)}
                placeholder="Contoh: 17 atau -"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK (Nomor Induk Karyawan)
              </label>
              <input
                type="text"
                value={nik}
                onChange={e => setNik(e.target.value)}
                placeholder="Contoh: 240701706 atau -"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Ns. Ogi Gupron, S.Kep"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Masuk (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={tanggalMasuk}
                onChange={e => setTanggalMasuk(e.target.value)}
                placeholder="DD/MM/YYYY atau BLM ADA"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pendidikan
              </label>
              <select
                value={pendidikan}
                onChange={e => setPendidikan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="S1">S1 (Ners)</option>
                <option value="D3">D3 (Amd. Kep)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perawat Klinik
              </label>
              <select
                value={perawatKlinik}
                onChange={e => setPerawatKlinik(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="PRA PK">PRA PK</option>
                <option value="PK 1">PK 1</option>
                <option value="PK 2">PK 2</option>
                <option value="PK 3">PK 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Karyawan
              </label>
              <select
                value={statusKaryawan}
                onChange={e => setStatusKaryawan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="KARTAP">KARTAP</option>
                <option value="PKWT">PKWT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor STR
              </label>
              <input
                type="text"
                value={noStr}
                onChange={e => setNoStr(e.target.value)}
                placeholder="Nomor STR"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masa Aktif STR
              </label>
              <input
                type="text"
                value={masaAktifStr}
                onChange={e => setMasaAktifStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor SIPP
              </label>
              <input
                type="text"
                value={noSipp}
                onChange={e => setNoSipp(e.target.value)}
                placeholder="503/xxxx/xxxx/SIP.P/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masa Aktif SIPP (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={masaAktifSipp}
                onChange={e => setMasaAktifSipp(e.target.value)}
                placeholder="Contoh: 20/05/2031"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor NIRA (PPNI)
              </label>
              <input
                type="text"
                value={noNira}
                onChange={e => setNoNira(e.target.value)}
                placeholder="Contoh: 32150123456"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Pelatihan Tambahan
              </label>
              <input
                type="text"
                value={pelatihanExtra}
                onChange={e => setPelatihanExtra(e.target.value)}
                placeholder="Misal: ENIL, Trauma Nursing"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Checklist Sertifikasi Pelatihan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {trainings.map(tr => (
                <label
                  key={tr}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs cursor-pointer hover:bg-emerald-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedTrainings.includes(tr)}
                    onChange={() => toggleTraining(tr)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{tr}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
            >
              Simpan Data Perawat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
