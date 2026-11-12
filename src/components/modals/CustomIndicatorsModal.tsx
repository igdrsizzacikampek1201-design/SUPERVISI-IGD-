import React, { useState } from 'react';
import { SupervisiIndicator } from '../../types';

interface CustomIndicatorsModalProps {
  isOpen: boolean;
  indicators: SupervisiIndicator[];
  onClose: () => void;
  onSaveIndicator: (indicator: { id?: string; title: string; category: string; guide: string }) => void;
  onDeleteIndicator: (id: string) => void;
  onMoveIndicator: (index: number, direction: number) => void;
  onResetToDefault: () => void;
  onDownloadDoc: () => void;
}

export const CustomIndicatorsModal: React.FC<CustomIndicatorsModalProps> = ({
  isOpen,
  indicators,
  onClose,
  onSaveIndicator,
  onDeleteIndicator,
  onMoveIndicator,
  onResetToDefault,
  onDownloadDoc
}) => {
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [guide, setGuide] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (ind: SupervisiIndicator) => {
    setEditId(ind.id);
    setTitle(ind.title);
    setCategory(ind.category || '');
    setGuide(ind.guide || '');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setCategory('');
    setGuide('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !guide.trim()) return;

    onSaveIndicator({
      id: editId || undefined,
      title: title.trim(),
      category: category.trim() || 'SPO Keperawatan IGD',
      guide: guide.trim()
    });

    handleCancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-sliders text-amber-300"></i>
            <div>
              <h3 className="text-base font-bold">Kelola List Indikator Supervisi Klinis (Custom)</h3>
              <p className="text-[11px] text-emerald-100">
                Tambah, ubah urutan, edit, atau hapus item penilaian & panduan latihan mandiri
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Form Tambah / Edit Indikator */}
          <form onSubmit={handleSubmit} className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                {editId ? (
                  <>
                    <i className="fa-solid fa-pen-to-square mr-1"></i> Edit Item Indikator
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus-circle mr-1"></i> Tambah Item Indikator Baru
                  </>
                )}
              </h4>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Indikator / Kompetensi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Pemasangan Infus & Terapi Cairan Emergensi"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori / Standar SPO
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Contoh: SPO Resusitasi / PPI"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Panduan Langkah Prosedur (Untuk Latihan Mandiri SDM di Rumah) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={guide}
                onChange={e => setGuide(e.target.value)}
                placeholder="Tuliskan langkah kunci/kriteria penilaian agar perawat bisa berlatih mandiri di rumah..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1.5"
              >
                {editId ? (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Simpan Perubahan</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-plus"></i>
                    <span>Tambahkan ke List Supervisi</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Daftar Indikator Aktif Saat Ini */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Indikator Aktif ({indicators.length} Item)
              </h4>
              <button
                type="button"
                onClick={onResetToDefault}
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition inline-flex items-center gap-1"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>Kembalikan Default IGD</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {indicators.map((ind, idx) => (
                <div
                  key={ind.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-emerald-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{ind.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        {ind.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-7">{ind.guide}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMoveIndicator(idx, -1)}
                      disabled={idx === 0}
                      title="Naikkan Urutan"
                      className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-200 transition"
                    >
                      <i className="fa-solid fa-arrow-up text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveIndicator(idx, 1)}
                      disabled={idx === indicators.length - 1}
                      title="Turunkan Urutan"
                      className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-200 transition"
                    >
                      <i className="fa-solid fa-arrow-down text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(ind)}
                      title="Edit Indikator"
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteIndicator(ind.id)}
                      title="Hapus Indikator"
                      className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onDownloadDoc}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
          >
            <i className="fa-solid fa-file-word"></i>
            <span>Unduh Modul Latihan (.doc)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
          >
            Selesai &amp; Terapkan
          </button>
        </div>
      </div>
    </div>
  );
};
