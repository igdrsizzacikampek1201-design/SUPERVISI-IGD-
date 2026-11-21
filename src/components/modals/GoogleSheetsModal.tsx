import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { APPS_SCRIPT_TEMPLATE, extractSpreadsheetId } from '../../utils/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  // Direct Google OAuth state
  googleUser: User | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  spreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  autoSyncGoogle: boolean;
  autoBackupDrive: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  // Webhook state
  webhookUrl: string;
  autoSyncWebhook: boolean;
  // Callbacks
  onClose: () => void;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
  onCreateSpreadsheet: () => void;
  onConnectSpreadsheetId: (id: string) => void;
  onSyncNowGoogle: () => void;
  onToggleAutoSyncGoogle: (enabled: boolean) => void;
  onToggleAutoBackupDrive: (enabled: boolean) => void;
  onSaveWebhook: (url: string, autoSync: boolean) => void;
  onTestWebhook: (url: string) => void;
  onSyncNowWebhook: (url: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  googleUser,
  needsAuth,
  isLoggingIn,
  spreadsheetId,
  spreadsheetTitle,
  spreadsheetUrl,
  autoSyncGoogle,
  autoBackupDrive,
  isSyncing,
  lastSyncedAt,
  webhookUrl,
  autoSyncWebhook,
  onClose,
  onGoogleLogin,
  onGoogleLogout,
  onCreateSpreadsheet,
  onConnectSpreadsheetId,
  onSyncNowGoogle,
  onToggleAutoSyncGoogle,
  onToggleAutoBackupDrive,
  onSaveWebhook,
  onTestWebhook,
  onSyncNowWebhook
}) => {
  const [modeTab, setModeTab] = useState<'google' | 'webhook'>('google');
  const [inputSheetId, setInputSheetId] = useState(spreadsheetId);
  const [url, setUrl] = useState(webhookUrl);
  const [webhookAuto, setWebhookAuto] = useState(autoSyncWebhook);
  const [showScript, setShowScript] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    setInputSheetId(spreadsheetId);
    setUrl(webhookUrl);
    setWebhookAuto(autoSyncWebhook);
  }, [spreadsheetId, webhookUrl, autoSyncWebhook, isOpen]);

  if (!isOpen) return null;

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } catch {
      // Fallback ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-file-excel text-emerald-300 text-lg"></i>
            <div>
              <h3 className="text-base font-bold">Kirim Otomatis ke Google Sheets</h3>
              <p className="text-[11px] text-emerald-100">
                Sinkronisasi otomatis data perawat, supervisi, pelatihan &amp; file backup ke Google
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white transition p-1"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="bg-slate-100 px-6 pt-3 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setModeTab('google')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition ${
              modeTab === 'google'
                ? 'bg-white text-emerald-800 border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <i className="fa-brands fa-google mr-1.5"></i>
            Akun Google (Langsung &amp; Otomatis)
          </button>
          <button
            type="button"
            onClick={() => setModeTab('webhook')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition ${
              modeTab === 'webhook'
                ? 'bg-white text-emerald-800 border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-link mr-1.5"></i>
            Apps Script Webhook
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {modeTab === 'google' ? (
            <div className="space-y-4">
              {/* Step 1: Google Auth */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {needsAuth || !googleUser ? (
                  <>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">
                        1. Masuk dengan Akun Google Anda
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Izinkan aplikasi membuat &amp; memperbarui Google Spreadsheet serta file backup Anda secara otomatis.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onGoogleLogin}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl shadow-xs font-semibold text-xs transition shrink-0 cursor-pointer disabled:opacity-60"
                    >
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="w-4 h-4 shrink-0"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                      <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
                          alt={googleUser.displayName || 'Google User'}
                          className="w-9 h-9 rounded-full border border-slate-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                          {(googleUser.email || 'G')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{googleUser.displayName || 'Akun Google Terhubung'}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Aktif
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{googleUser.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onGoogleLogout}
                      className="px-3 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition self-start sm:self-auto"
                    >
                      Keluar Akun
                    </button>
                  </>
                )}
              </div>

              {/* Step 2: Pilih atau Buat Spreadsheet */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      2. Target Google Spreadsheet
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Buat spreadsheet baru otomatis atau tempel link/ID spreadsheet Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={needsAuth || isSyncing}
                    onClick={onCreateSpreadsheet}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span>Buat Spreadsheet Otomatis</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputSheetId}
                    onChange={e => setInputSheetId(e.target.value)}
                    placeholder="Tempel URL atau Spreadsheet ID Google Sheets..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    disabled={needsAuth || !inputSheetId.trim() || isSyncing}
                    onClick={() => onConnectSpreadsheetId(extractSpreadsheetId(inputSheetId))}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
                  >
                    Hubungkan
                  </button>
                </div>

                {spreadsheetId && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <i className="fa-solid fa-table"></i>
                        <span>{spreadsheetTitle || 'Spreadsheet Terhubung'}</span>
                      </div>
                      <div className="text-[10px] font-mono text-emerald-700 break-all">
                        ID: {spreadsheetId}
                      </div>
                    </div>
                    {spreadsheetUrl && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] transition shrink-0"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        <span>Buka Sheets</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Pengaturan Kirim Otomatis */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">
                  3. Pengaturan Kirim Otomatis (Auto-Sync)
                </h4>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={autoSyncGoogle}
                    disabled={needsAuth || !spreadsheetId}
                    onChange={e => onToggleAutoSyncGoogle(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Kirim otomatis ke Google Sheets setiap ada perubahan data
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tab <em>Data Perawat</em>, <em>Riwayat Supervisi</em>, dan <em>Matriks Pelatihan</em> diperbarui otomatis setiap kali Anda menyimpan data baru.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition">
                  <input
                    type="checkbox"
                    checked={autoBackupDrive}
                    disabled={needsAuth}
                    onChange={e => onToggleAutoBackupDrive(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Sekaligus simpan file cadangan (.JSON) ke Google Drive
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Mengirim file <code className="bg-slate-100 px-1 rounded">Backup_Supervisi_IGD.json</code> ke Google Drive Anda saat sinkronisasi berjalan.
                    </span>
                  </div>
                </label>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">
                    {lastSyncedAt
                      ? `Terakhir dikirim: ${new Date(lastSyncedAt).toLocaleString('id-ID')}`
                      : 'Belum pernah dikirim pada sesi ini'}
                  </span>
                  <button
                    type="button"
                    disabled={needsAuth || !spreadsheetId || isSyncing}
                    onClick={onSyncNowGoogle}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className={`fa-solid ${isSyncing ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'}`}></i>
                    <span>{isSyncing ? 'Mengirim Data...' : 'Kirim File Sekarang ke Google Sheets'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Apps Script Web App URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-[11px]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={webhookAuto}
                  onChange={e => setWebhookAuto(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="font-bold text-slate-800 block">
                    Kirim otomatis seluruh data (Full Sync) setiap ada perubahan
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mengirim snapshot terbaru ke spreadsheet via webhook secara otomatis saat data diubah.
                  </span>
                </div>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTestWebhook(url)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
                >
                  Test Koneksi
                </button>
                <button
                  type="button"
                  onClick={() => onSyncNowWebhook(url)}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition"
                >
                  <i className="fa-solid fa-paper-plane mr-1"></i>
                  Kirim Semua Data Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setShowScript(s => !s)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 underline ml-auto"
                >
                  {showScript ? 'Sembunyikan Kode Script' : 'Lihat Kode Apps Script'}
                </button>
              </div>

              {showScript && (
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-400">
                      Salin kode ini ke Extensions &gt; Apps Script di Spreadsheet Anda:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[11px] font-semibold"
                    >
                      {copiedScript ? 'Tersalin!' : 'Salin Kode'}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono overflow-x-auto max-h-48 text-slate-200 leading-relaxed">
                    {APPS_SCRIPT_TEMPLATE}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onSaveWebhook(url, webhookAuto)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
                >
                  Simpan Pengaturan Webhook
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
