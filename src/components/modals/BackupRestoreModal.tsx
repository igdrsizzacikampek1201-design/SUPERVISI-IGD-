import React, { useState, useRef } from 'react';
import { BackupPayload, parseBackupJson } from '../../utils/backupJson';

interface BackupRestoreModalProps {
  isOpen: boolean;
  counts: {
    nurses: number;
    supervisiLogs: number;
    indicators: number;
    trainings: number;
  };
  onClose: () => void;
  onDownloadBackup: () => void;
  onRestoreBackup: (payload: BackupPayload) => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  counts,
  onClose,
  onDownloadBackup,
  onRestoreBackup
}) => {
  const [parsedBackup, setParsedBackup] = useState<BackupPayload | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError('');
    setParsedBackup(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const payload = parseBackupJson(text);
        setParsedBackup(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal membaca file JSON.');
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file dari perangkat Anda.');
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleConfirmRestore = () => {
    if (!parsedBackup) return;
    onRestoreBackup(parsedBackup);
    setParsedBackup(null);
    setFileName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-database text-emerald-400 text-lg"></i>
            <div>
              <h3 className="text-base font-bold">Backup &amp; Pulihkan Data (.JSON)</h3>
              <p className="text-[11px] text-slate-300">
                Simpan cadangan seluruh data agar mudah dipindahkan ke website atau perangkat baru
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs max-h-[82vh] overflow-y-auto">
          {/* Bagian 1: Export / Download Backup JSON */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  1. Unduh File Backup (.JSON)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Menyimpan seluruh data perawat, riwayat supervisi, indikator kustom, dan daftar pelatihan dalam 1 file JSON.
                </p>
              </div>
              <i className="fa-solid fa-file-code text-2xl text-emerald-700 shrink-0"></i>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 border border-emerald-100">
                <div className="text-base font-extrabold text-slate-900">{counts.nurses}</div>
                <div className="text-[10px] text-slate-500 font-medium">Data Perawat</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-emerald-100">
                <div className="text-base font-extrabold text-slate-900">{counts.supervisiLogs}</div>
                <div className="text-[10px] text-slate-500 font-medium">Riwayat Supervisi</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-emerald-100">
                <div className="text-base font-extrabold text-slate-900">{counts.indicators}</div>
                <div className="text-[10px] text-slate-500 font-medium">Indikator</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-emerald-100">
                <div className="text-base font-extrabold text-slate-900">{counts.trainings}</div>
                <div className="text-[10px] text-slate-500 font-medium">Pelatihan</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onDownloadBackup}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-download"></i>
              <span>Unduh File Backup (.JSON) Sekarang</span>
            </button>
          </div>

          {/* Bagian 2: Import / Restore JSON */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                2. Pulihkan Data dari File Backup (.JSON)
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Jika data di browser hilang atau Anda membuka website baru, unggah file <code className="bg-slate-200 px-1 rounded">.json</code> hasil backup di sini.
              </p>
            </div>

            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleInputChange}
                className="hidden"
              />
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400 mb-2"></i>
              <p className="text-xs font-semibold text-slate-700">
                {fileName ? `File dipilih: ${fileName}` : 'Klik untuk pilih file .JSON atau seret file ke sini'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Format: Backup_Supervisi_IGD_*.json</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation shrink-0"></i>
                <span>{error}</span>
              </div>
            )}

            {parsedBackup && (
              <div className="p-3.5 rounded-xl bg-white border border-emerald-300 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">
                    <i className="fa-solid fa-circle-check mr-1"></i> File Backup Valid
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Dibuat: {new Date(parsedBackup.exportedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <strong className="text-slate-900">{parsedBackup.data.nurses.length}</strong> Perawat
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <strong className="text-slate-900">{parsedBackup.data.supervisiLogs.length}</strong> Supervisi
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <strong className="text-slate-900">{parsedBackup.data.indicators.length || 'Default'}</strong> Indikator
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                    <strong className="text-slate-900">{parsedBackup.data.trainings.length || 'Default'}</strong> Pelatihan
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmRestore}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-rotate-right"></i>
                  <span>Pulihkan &amp; Terapkan Data Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
