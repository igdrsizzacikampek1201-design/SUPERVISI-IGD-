import React from 'react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type !== 'danger';
        return (
          <div
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            className={`pointer-events-auto cursor-pointer flex items-center gap-2.5 px-4 py-3 rounded-xl border-l-4 shadow-lg text-xs font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-slate-900 text-white border-emerald-500'
                : 'bg-rose-600 text-white border-rose-300'
            }`}
          >
            {isSuccess ? (
              <i className="fa-solid fa-circle-check text-emerald-400"></i>
            ) : (
              <i className="fa-solid fa-circle-exclamation text-white"></i>
            )}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
