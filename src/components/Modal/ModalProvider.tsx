import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalContextType {
  openModal: (content: ReactNode, key?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({ openModal: () => {}, closeModal: () => {} });

export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{ content: ReactNode; key: string } | null>(null);

  const openModal = useCallback((content: ReactNode, key = 'default') => {
    setModal({ content, key });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {modal && (
            <motion.div
              key={modal.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
              onClick={closeModal}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-lg rounded-t-2xl bg-[#16213e] p-4"
                style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}
                onClick={(e) => e.stopPropagation()}
              >
                {modal.content}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </ModalContext.Provider>
  );
}
