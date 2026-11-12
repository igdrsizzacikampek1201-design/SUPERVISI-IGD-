import React from 'react';

export type ActiveTab = 'database' | 'supervisi' | 'pelatihan';

interface HeaderProps {
  activeTab: ActiveTab;
  totalNurses: number;
  totalSupervisi: number;
  onSwitchTab: (tab: ActiveTab) => void;
  onOpenGoogleSheets: () => void;
  onDownloadDoc: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  totalNurses,
  totalSupervisi,
  onSwitchTab,
  onOpenGoogleSheets,
  onDownloadDoc,
  onReset
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Brand / Hospital Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
              <i className="fa-solid fa-heart-pulse text-xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  SIM-SDM KEPERAWATAN IGD
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Instalasi Gawat Darurat
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>
                  <i className="fa-solid fa-shield-halved text-emerald-600 mr-1"></i>
                  Kredensial STR/SIPP, Supervisi Custom &amp; Integrasi Google Sheets
                </span>
              </p>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenGoogleSheets}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs"
            >
              <i className="fa-solid fa-file-excel"></i>
              <span>Pengaturan Google Sheets</span>
            </button>
            <button
              onClick={onDownloadDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              <i className="fa-solid fa-file-word text-blue-600"></i>
              <span>Unduh Modul (.doc)</span>
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 3 Tab Navigasi Utama */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 -mb-px" aria-label="Tabs">
          <button
            onClick={() => onSwitchTab('database')}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap transition border-b-2 ${
              activeTab === 'database'
                ? 'border-emerald-700 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <i className="fa-solid fa-user-nurse"></i>
            <span>1. Data Kredensial SDM</span>
            <span
              className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'database'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {totalNurses}
            </span>
          </button>

          <button
            onClick={() => onSwitchTab('supervisi')}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap transition border-b-2 ${
              activeTab === 'supervisi'
                ? 'border-emerald-700 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <i className="fa-solid fa-clipboard-check"></i>
            <span>2. Supervisi Klinis &amp; Custom Indikator</span>
            <span
              className={`ml-1 px-2 py-0.5 text-xs rounded-full font-bold ${
                activeTab === 'supervisi'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {totalSupervisi}
            </span>
          </button>

          <button
            onClick={() => onSwitchTab('pelatihan')}
            className={`group inline-flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap transition border-b-2 ${
              activeTab === 'pelatihan'
                ? 'border-emerald-700 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 font-medium'
            }`}
          >
            <i className="fa-solid fa-list-check"></i>
            <span>3. Matriks Pelatihan (Sederhana)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
