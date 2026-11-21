import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm\">
      <div className=\"w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative\">
        <button
          onClick={onCancel}
          className=\"absolute top-4 right-4 text-slate-400 hover:text-white transition-colors\"
        >
          <X className=\"w-5 h-5\" />
        </button>

        <div className=\"flex items-center gap-4 mb-4\">
          <div className={p-3 rounded-xl }>
            <AlertTriangle className=\"w-6 h-6\" />
          </div>
          <div>
            <h3 className=\"text-lg font-semibold text-white\">{title}</h3>
            <p className=\"text-sm text-slate-400 mt-1\">{message}</p>
          </div>
        </div>

        <div className=\"flex items-center justify-end gap-3 mt-6\">
          <button
            onClick={onCancel}
            className=\"px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl transition-colors\"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={px-4 py-2 text-sm font-medium rounded-xl text-white transition-all shadow-lg }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};