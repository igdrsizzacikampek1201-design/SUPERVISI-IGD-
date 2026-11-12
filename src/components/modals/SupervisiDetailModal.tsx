import React from 'react';
import { SupervisiLog } from '../../types';

interface SupervisiDetailModalProps {
  isOpen: boolean;
  log: SupervisiLog | null;
  onClose: () => void;
  onPrint: () => void;
}

export const SupervisiDetailModal: React.FC<SupervisiDetailModalProps> = ({
  isOpen,
  log,
  onClose,
  onPrint
}) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-base font-bold flex items-center">
            <i className="fa-solid fa-file-medical mr-2"></i>
            <span>Detail Laporan Supervisi Klinis</span>
          </h3>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Nama Perawat:</span>
              <span className="font-bold text-slate-900">
                {log.nurseName} ({log.nursePk})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tanggal &amp; Shift:</span>
              <span className="font-semibold text-slate-800">
                {log.date} | {log.shift}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Supervisor:</span>
              <span className="font-semibold text-slate-800">{log.supervisor}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500">Hasil Akhir:</span>
              <span className="font-bold text-emerald-700">
                {log.category} — {log.totalScore}/{log.maxScore} Poin ({log.percentage}%)
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1.5">Rincian Penilaian Per Indikator:</h4>
            <div className="space-y-1">
              {log.itemsSnapshot.map((item, idx) => {
                const label =
                  item.score === 2
                    ? 'Kompeten (2)'
                    : item.score === 1
                    ? 'Bimbingan (1)'
                    : 'Belum (0)';
                const color =
                  item.score === 2
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : item.score === 1
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-slate-100 gap-2"
                  >
                    <span className="text-slate-700 font-medium">
                      {idx + 1}. {item.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold border whitespace-nowrap text-[11px] ${color}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 mb-1">
              Catatan &amp; Rencana Latihan Mandiri (RTL):
            </h4>
            <p className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-700 leading-relaxed">
              {log.notes || 'Tidak ada catatan khusus.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onPrint}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition inline-flex items-center gap-1.5"
          >
            <i className="fa-solid fa-print"></i>
            <span>Cetak Laporan</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
