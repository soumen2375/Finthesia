import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  headerActions?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg", headerActions }: ModalProps) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "w-full bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl pointer-events-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden",
                maxWidth
              )}
            >
              <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-50 shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate pr-4">{title}</h2>
                <div className="flex items-center space-x-2 shrink-0">
                  {headerActions}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
