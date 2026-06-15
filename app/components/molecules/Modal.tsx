import { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transform transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-500 cursor-pointer p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {title && (
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 pr-8">
            {title}
          </h3>
        )}

        {children}
      </div>
    </div>
  );
}
