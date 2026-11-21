import React, { useState, useEffect, useMemo } from 'react';
import { Nurse, SupervisiIndicator, SupervisiLog, SupervisiScoreItem } from '../types';
import { normalizePK } from '../initialData';

interface TabSupervisiProps {
  nurses: Nurse[];
  indicators: SupervisiIndicator[];
  logs: SupervisiLog[];
  preselectedNurseId?: string | null;
  onOpenIndicatorsModal: () => void;
  onDownloadDoc: () => void;
  onPrintDoc: () => void;
  onSubmitSupervisi: (log: Omit<SupervisiLog, 'id'>) => void;
  onOpenDetailModal: (log: SupervisiLog) => void;
  onDeleteLog: (log: SupervisiLog) => void;
}

export const TabSupervisi: React.FC<TabSupervisiProps> = ({
  nurses,
  indicators,
  logs,
  preselectedNurseId,
  onOpenIndicatorsModal,
  onDownloadDoc,
  onPrintDoc,
  onSubmitSupervisi,
  onOpenDetailModal,
  onDeleteLog
}) => {
  const [selectedNurseId, setSelectedNurseId] = useState<string>(
    preselectedNurseId || nurses[0]?.id || ''
  );
  const [supervisor, setSupervisor] = useState('Kepala Ruangan IGD');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Pagi (07.00 - 14.00)');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');

  // Update selected nurse if preselectedNurseId changes
  useEffect(() => {
    if (preselectedNurseId) {
      setSelectedNurseId(preselectedNurseId);
    } else if (!selectedNurseId && nurses.length > 0) {
      setSelectedNurseId(nurses[0].id);
    }
  }, [preselectedNurseId, nurses, selectedNurseId]);

  // Initialize scores with 2 (Kompeten) for any indicator not in scores
  useEffect(() => {
    setScores(prev => {
      const next: Record<string, number> = { ...prev };
      indicators.forEach(ind => {
        if (next[ind.id] === undefined) {
          next[ind.id] = 2;
        }
      });
      return next;
    });
  }, [indicators]);

  // Compute live score
  const { totalScore, maxScore, percentage, category, colorClass } = useMemo(() => {
    let total = 0;
    const max = indicators.length * 2;
    indicators.forEach(ind => {
      total += scores[ind.id] !== undefined ? scores[ind.id] : 2;
    });
    const pct = max > 0 ? Math.round((total / max) * 100) : 0;

    let cat = 'Perlu Latihan Ulang';
    let color = 'text-rose-600';

    if (pct >= 85) {
      cat = 'Kompeten / Sangat Baik';
      color = 'text-emerald-700';
    } else if (pct >= 65) {
      cat = 'Perlu Bimbingan';
      color = 'text-amber-700';
    }

    return {
      totalScore: total,
      maxScore: max,
      percentage: pct,
      category: cat,
      colorClass: color
    };
  }, [indicators, scores]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNurse = nurses.find(n => n.id === selectedNurseId);
    if (!targetNurse) return;

    const itemsSnapshot: SupervisiScoreItem[] = indicators.map(ind => ({
      title: ind.title,
      category: ind.category,
      score: scores[ind.id] !== undefined ? scores[ind.id] : 2
    }));

    let catName = 'Perlu Latihan Ulang';
    if (percentage >= 85) catName = 'Kompeten';
    else if (percentage >= 65) catName = 'Perlu Bimbingan';

    onSubmitSupervisi({
      nurseId: targetNurse.id,
      nurseName: targetNurse.nama,
      nursePk: normalizePK(targetNurse.perawatKlinik),
      supervisor: supervisor.trim() || 'Kepala Ruangan IGD',
      date,
      shift,
      itemsSnapshot,
      totalScore,
      maxScore,
      percentage,
      category: catName,
      notes: notes.trim() || 'Tidak ada catatan khusus.'
    });

    setNotes('');
  };

  return (
    <section className="space-y-6">
      {/* Banner Unduh Dokumen Latihan Mandiri SDM & Kelola List Custom */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-5 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-100 text-[11px] font-semibold">
            <i className="fa-solid fa-book-medical"></i> Modul Supervisi IGD
          </div>
          <h2 className="text-base sm:text-lg font-bold">
            Supervisi Klinis &amp; Panduan Latihan Mandiri
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Atur indikator supervisi sesuai kebutuhan unit IGD dan unduh panduan latihan mandiri untuk staf perawat.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenIndicatorsModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition"
          >
            <i className="fa-solid fa-sliders"></i>
            <span>Kelola / Tambah List Indikator</span>
          </button>
          <button
            onClick={onDownloadDoc}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs rounded-xl shadow-xs transition"
          >
            <i className="fa-solid fa-file-word text-blue-700"></i>
            <span>Unduh Dokumen (.doc)</span>
          </button>
          <button
            onClick={onPrintDoc}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-700/70 hover:bg-emerald-700 text-white border border-emerald-400/40 font-semibold text-xs rounded-xl transition"
          >
            <i className="fa-solid fa-file-pdf"></i>
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Penilaian Supervisi Klinis (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg">
                <i className="fa-solid fa-clipboard-user"></i>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulir Penilaian Supervisi Klinis
                </h3>
                <p className="text-xs text-slate-500">
                  Menggunakan <strong className="text-emerald-700">{indicators.length}</strong> indikator aktif yang dapat dikustomisasi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenIndicatorsModal}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition self-start sm:self-auto"
            >
              <i className="fa-solid fa-plus mr-1"></i>Ubah List Soal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perawat yang Disupervisi <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedNurseId}
                  onChange={e => setSelectedNurseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {nurses.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.nama} ({normalizePK(n.perawatKlinik)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supervisor (Penilai) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={supervisor}
                  onChange={e => setSupervisor(e.target.value)}
                  placeholder="Nama Kepala Ruangan / Katim"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Supervisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shift Dinas <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={shift}
                  onChange={e => setShift(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Pagi (07.00 - 14.00)">Pagi (07.00 - 14.00)</option>
                  <option value="Sore (14.00 - 21.00)">Sore (14.00 - 21.00)</option>
                  <option value="Malam (21.00 - 07.00)">Malam (21.00 - 07.00)</option>
                </select>
              </div>
            </div>

            {/* Daftar Indikator Custom */}
            <div className="pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Indikator Penilaian
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kompeten (2)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Bimbingan (1)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Belum (0)
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {indicators.map((ind, idx) => {
                  const currentScore = scores[ind.id] !== undefined ? scores[ind.id] : 2;
                  return (
                    <div
                      key={ind.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {ind.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                              {ind.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{ind.guide}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name={`ind-${ind.id}`}
                            value={2}
                            checked={currentScore === 2}
                            onChange={() => setScores({ ...scores, [ind.id]: 2 })}
                            className="peer sr-only"
                          />
                          <div
                            className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition ${
                              currentScore === 2
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <i className="fa-solid fa-check mr-1"></i>Kompeten (2)
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name={`ind-${ind.id}`}
                            value={1}
                            checked={currentScore === 1}
                            onChange={() => setScores({ ...scores, [ind.id]: 1 })}
                            className="peer sr-only"
                          />
                          <div
                            className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition ${
                              currentScore === 1
                                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <i className="fa-solid fa-user-clock mr-1"></i>Bimbingan (1)
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="radio"
                            name={`ind-${ind.id}`}
                            value={0}
                            checked={currentScore === 0}
                            onChange={() => setScores({ ...scores, [ind.id]: 0 })}
                            className="peer sr-only"
                          />
                          <div
                            className={`py-1.5 px-2 rounded-lg border text-center text-[11px] font-semibold transition ${
                              currentScore === 0
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <i className="fa-solid fa-xmark mr-1"></i>Belum (0)
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Score Preview Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block">Hasil Evaluasi Kompetensi:</span>
                <span className={`text-sm font-bold ${colorClass}`}>
                  {category} ({percentage}%)
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-slate-900">{totalScore}</span>
                <span className="text-xs text-slate-500">/ {maxScore} Poin</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Supervisi &amp; Rencana Latihan Mandiri (RTL)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Tuliskan umpan balik klinis atau bagian prosedur yang perlu dilatih mandiri di rumah..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-check-circle"></i>
                <span>Simpan &amp; Kirim ke Google Sheets</span>
              </button>
            </div>
          </form>
        </div>

        {/* Riwayat Log Supervisi (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Hasil Supervisi</h3>
              <p className="text-xs text-slate-500">Rekapitulasi evaluasi kinerja perawat tersimpan</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {logs.length} Laporan
            </span>
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[680px] pr-1 flex-1">
            {logs.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                <i className="fa-solid fa-clipboard-list text-3xl text-slate-300 mb-2"></i>
                <p className="text-xs font-semibold text-slate-600">
                  Belum ada riwayat supervisi klinis
                </p>
                <p className="text-[11px] text-slate-400">
                  Gunakan formulir di sebelah kiri untuk mencatat hasil supervisi.
                </p>
              </div>
            ) : (
              logs.map(log => {
                const badgeStyle =
                  log.category === 'Kompeten'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : log.category === 'Perlu Bimbingan'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200';

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900">{log.nurseName}</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                            {log.nursePk}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <i className="fa-regular fa-calendar mr-1"></i>
                          {log.date} • {log.shift}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badgeStyle}`}
                        >
                          {log.category} ({log.percentage}%)
                        </span>
                        <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                          Skor: {log.totalScore}/{log.maxScore}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                      &quot;{log.notes}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>
                        Supervisor: <strong className="text-slate-700">{log.supervisor}</strong>
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onOpenDetailModal(log)}
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          <i className="fa-solid fa-eye mr-1"></i>Rincian
                        </button>
                        <button
                          onClick={() => onDeleteLog(log)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
