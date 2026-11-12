import React, { useState } from 'react';

interface ManageTrainingsModalProps {
  isOpen: boolean;
  trainings: string[];
  onClose: () => void;
  onAddTraining: (name: string) => void;
  onRemoveTraining: (name: string) => void;
}

export const ManageTrainingsModal: React.FC<ManageTrainingsModalProps> = ({
  isOpen,
  trainings,
  onClose,
  onAddTraining,
  onRemoveTraining
}) => {
  const [newTraining, setNewTraining] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraining.trim()) return;
    onAddTraining(newTraining.trim());
    setNewTraining('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-800 px-5 py-4 flex items-center justify-between text-white">
          <h3 className="text-sm font-bold flex items-center">
            <i className="fa-solid fa-list-check text-emerald-400 mr-2"></i>
            <span>Kelola Kolom Jenis Pelatihan</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              required
              value={newTraining}
              onChange={e => setNewTraining(e.target.value)}
              placeholder="Nama pelatihan baru (misal: ENIL / Trauma)"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition"
            >
              Tambah
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {trainings.map(tr => (
              <div
                key={tr}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <span className="font-semibold text-slate-800">{tr}</span>
                <button
                  type="button"
                  onClick={() => onRemoveTraining(tr)}
                  className="text-rose-500 hover:text-rose-700 p-1.5 rounded transition"
                  title="Hapus Kolom Pelatihan"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
