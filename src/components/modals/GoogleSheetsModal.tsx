import React, { useState, useEffect } from 'react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  webhookUrl: string;
  onClose: () => void;
  onSave: (url: string) => void;
  onTest: (url: string) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  webhookUrl,
  onClose,
  onSave,
  onTest
}) => {
  const [url, setUrl] = useState(webhookUrl);

  useEffect(() => {
    setUrl(webhookUrl);
  }, [webhookUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-file-excel text-emerald-300 text-lg"></i>
            <div>
              <h3 className="text-base font-bold">Integrasi Google Sheets Webhook</h3>
              <p className="text-[11px] text-emerald-100">
                Hubungkan aplikasi dengan Spreadsheet Anda melalui Apps Script URL
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

        <div className="p-6 space-y-4 text-xs">
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
            <p className="text-[11px] text-slate-500 mt-1">
              Data rekap supervisi dan hasil input perawat akan dikirim otomatis ke spreadsheet Anda saat tombol simpan ditekan.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 text-slate-700">
            <span className="font-bold block text-emerald-900">
              <i className="fa-solid fa-circle-info mr-1"></i> Cara Singkat Setup Google Sheets:
            </span>
            <p className="text-[11px] leading-relaxed">
              1. Buat Google Spreadsheet baru.<br />
              2. Buka <em>Extensions &gt; Apps Script</em> dan paste script penerima JSON.<br />
              3. Deploy sebagai <em>Web App</em> (Access: <em>Anyone</em>), lalu salin URL Web App dan paste di atas.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onTest(url)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            Test Koneksi
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onSave(url)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition"
            >
              Simpan Webhook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
