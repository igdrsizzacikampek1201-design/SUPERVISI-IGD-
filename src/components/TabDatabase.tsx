import React, { useState } from 'react';
import { Nurse } from '../types';
import { normalizePK } from '../initialData';

interface TabDatabaseProps {
  nurses: Nurse[];
  onOpenAddModal: () => void;
  onOpenEditModal: (nurse: Nurse) => void;
  onQuickSupervisi: (nurseId: string) => void;
  onDeleteNurse: (nurse: Nurse) => void;
  onExportCSV: () => void;
}

export const TabDatabase: React.FC<TabDatabaseProps> = ({
  nurses,
  onOpenAddModal,
  onOpenEditModal,
  onQuickSupervisi,
  onDeleteNurse,
  onExportCSV
}) => {
  const [search, setSearch] = useState('');
  const [filterPend, setFilterPend] = useState('ALL');
  const [filterPk, setFilterPk] = useState('ALL');

  const filtered = nurses.filter(n => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (n.nama && n.nama.toLowerCase().includes(q)) ||
      (n.nik && n.nik.toLowerCase().includes(q)) ||
      (n.noStr && n.noStr.toLowerCase().includes(q)) ||
      (n.noSipp && n.noSipp.toLowerCase().includes(q));

    const matchPend = filterPend === 'ALL' || n.pendidikan === filterPend;
    const matchPk = filterPk === 'ALL' || normalizePK(n.perawatKlinik) === filterPk;

    return matchSearch && matchPend && matchPk;
  });

  return (
    <section className="space-y-5">
      {/* Toolbar Pencarian & Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Database Kepegawaian &amp; Kredensial Perawat IGD
            </h2>
            <p className="text-xs text-slate-500">
              Daftar lengkap 17 perawat IGD beserta nomor STR, SIPP, masa berlaku, NIRA, dan pelatihan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <i className="fa-solid fa-file-excel text-emerald-600"></i>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <i className="fa-solid fa-print"></i>
              <span>Cetak Tabel</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Tambah Perawat</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="lg:col-span-2 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari Nama, NIK, No. STR, atau No. SIPP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>

          <select
            value={filterPend}
            onChange={e => setFilterPend(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">Semua Pendidikan</option>
            <option value="S1">S1 / Ners</option>
            <option value="D3">D3 Keperawatan</option>
          </select>

          <select
            value={filterPk}
            onChange={e => setFilterPk(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">Semua Jenjang PK</option>
            <option value="PK 2">PK 2</option>
            <option value="PK 1">PK 1</option>
            <option value="PRA PK">PRA PK</option>
          </select>
        </div>
      </div>

      {/* Tabel Responsive Database Perawat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 font-semibold text-center w-12">No</th>
                <th className="py-3 px-3 font-semibold">NIK</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Nama Perawat</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Tgl Masuk</th>
                <th className="py-3 px-3 font-semibold text-center">Pend.</th>
                <th className="py-3 px-3 font-semibold text-center whitespace-nowrap">Perawat Klinik</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold min-w-[170px]">No. STR (Masa Aktif)</th>
                <th className="py-3 px-3 font-semibold min-w-[210px]">No. SIPP</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">Masa Aktif SIPP</th>
                <th className="py-3 px-3 font-semibold">No. NIRA</th>
                <th className="py-3 px-4 font-semibold min-w-[170px]">Pelatihan</th>
                <th className="py-3 px-3 font-semibold text-center sticky right-0 bg-slate-800 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((n, idx) => {
                const pkNorm = normalizePK(n.perawatKlinik);
                const pkBadge =
                  pkNorm === 'PK 2'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : pkNorm === 'PK 1'
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';

                const statusBadge =
                  n.statusKaryawan === 'KARTAP'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                const isMissingTgl =
                  !n.tanggalMasuk ||
                  n.tanggalMasuk.toUpperCase().includes('BLM ADA') ||
                  n.tanggalMasuk === '-';
                const isMissingNik = !n.nik || n.nik === '-';

                const allTrainings = [...(n.pelatihan || [])];
                if (n.pelatihanExtra && n.pelatihanExtra.trim() !== '') {
                  allTrainings.push(n.pelatihanExtra.trim());
                }

                return (
                  <tr
                    key={n.id}
                    className={`hover:bg-emerald-50/40 transition group ${
                      idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold text-slate-600">{n.no || '-'}</td>
                    <td
                      className={`py-3 px-3 font-mono text-[11px] ${
                        isMissingNik ? 'text-rose-500 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      {n.nik || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{n.nama}</td>
                    <td
                      className={`py-3 px-3 whitespace-nowrap ${
                        isMissingTgl ? 'text-amber-600 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      {n.tanggalMasuk || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">{n.pendidikan}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-bold ${pkBadge}`}>
                        {pkNorm}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold ${statusBadge}`}>
                        {n.statusKaryawan}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-slate-800">{n.noStr || '-'}</div>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {n.masaAktifStr || 'SEUMUR HIDUP'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700">{n.noSipp || '-'}</td>
                    <td className="py-3 px-3 whitespace-nowrap font-semibold text-slate-800">
                      {n.masaAktifSipp || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {n.noNira ? n.noNira : <span className="text-slate-400 italic">Kosong</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {allTrainings.length > 0 ? (
                          allTrainings.map((t, tidx) => (
                            <span
                              key={tidx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ada</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center sticky right-0 bg-white group-hover:bg-emerald-50/90 border-l border-slate-100 no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenEditModal(n)}
                          title="Edit Data"
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => onQuickSupervisi(n.id)}
                          title="Supervisi Klinis"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-100 rounded-lg transition"
                        >
                          <i className="fa-solid fa-clipboard-check"></i>
                        </button>
                        <button
                          onClick={() => onDeleteNurse(n)}
                          title="Hapus Data"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <i className="fa-solid fa-folder-open text-3xl text-slate-300 mb-2"></i>
            <p className="text-sm font-semibold text-slate-600">Data perawat tidak ditemukan</p>
            <p className="text-xs text-slate-400">
              Coba ubah kata kunci pencarian atau reset filter di atas.
            </p>
          </div>
        )}

        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Menampilkan {filtered.length} dari {nurses.length} perawat
          </span>
          <span className="text-emerald-700 font-semibold">
            <i className="fa-solid fa-circle-check mr-1"></i> Data Kredensial Aktif
          </span>
        </div>
      </div>
    </section>
  );
};
