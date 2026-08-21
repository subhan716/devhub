import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isDestructive = false }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[#00F0FF]/10 text-[#00F0FF]'}`}>
                  <AlertTriangle size={24} />
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-8">{message}</p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-300 dark:border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                    isDestructive 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-[#0A66C2] dark:bg-[#00F0FF] text-white dark:text-black hover:bg-[#004182] dark:hover:bg-[#00F0FF]/80 font-bold shadow-sm'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmModal;
