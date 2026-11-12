import React from 'react';
import { Nurse } from '../types';
import { normalizePK } from '../initialData';

interface TabPelatihanProps {
  nurses: Nurse[];
  trainingColumns: string[];
  onToggleTraining: (nurseId: string, trainingName: string) => void;
  onOpenManageTrainings: () => void;
}

export const TabPelatihan: React.FC<TabPelatihanProps> = ({
  nurses,
  trainingColumns,
  onToggleTraining,
  onOpenManageTrainings
}) => {
  return (
    <section className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matriks Pelatihan Perawat IGD
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik kotak centang untuk menandai pelatihan yang sudah diikuti perawat. Anda juga dapat menambah atau menghapus kolom jenis pelatihan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              onClick={onOpenManageTrainings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Tambah / Kelola Jenis Pelatihan</span>
            </button>
          </div>
        </div>

        {/* Tabel Matriks Ringkas & Bersih */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">No</th>
                <th className="py-3 px-4 min-w-[210px]">Nama Perawat</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Jenjang PK</th>
                {trainingColumns.map(tr => (
                  <th key={tr} className="py-3 px-3 text-center whitespace-nowrap">
                    {tr}
                  </th>
                ))}
                <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {nurses.map((n, idx) => {
                const userTrainings = n.pelatihan || [];
                const completedCount = trainingColumns.filter(t => userTrainings.includes(t)).length;
                const isComplete =
                  trainingColumns.length > 0 && completedCount === trainingColumns.length;

                return (
                  <tr
                    key={n.id}
                    className={`hover:bg-slate-50 transition ${
                      idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                      {n.no || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{n.nama}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {normalizePK(n.perawatKlinik)}
                      </span>
                    </td>
                    {trainingColumns.map(tr => {
                      const isChecked = userTrainings.includes(tr);
                      return (
                        <td key={tr} className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onToggleTraining(n.id, tr)}
                            className={`w-7 h-7 rounded-lg border transition inline-flex items-center justify-center cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
                                : 'bg-white border-slate-300 text-slate-300 hover:border-emerald-400 hover:text-emerald-500'
                            }`}
                          >
                            <i className={`fa-solid ${isChecked ? 'fa-check' : 'fa-minus'} text-xs`}></i>
                          </button>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isComplete ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          Lengkap ({completedCount}/{trainingColumns.length})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          {completedCount}/{trainingColumns.length}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
