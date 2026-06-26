import React from 'react';
import { X } from 'lucide-react';

export default function AdminModal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-[1300] flex items-start justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} my-8 animate-modal-in`}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-white rounded-t-xl z-10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="p-5 border-t border-border flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}