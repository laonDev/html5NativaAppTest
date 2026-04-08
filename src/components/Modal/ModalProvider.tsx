import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalContextType {
  openModal: (content: ReactNode, key?: string, options?: ModalOptions) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({ openModal: () => {}, closeModal: () => {} });

export const useModal = () => useContext(ModalContext);

type ModalPlacement = 'bottom' | 'center';

interface ModalOptions {
  placement?: ModalPlacement;
  panelClassName?: string;
  overlayClassName?: string;
}

function joinClassName(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{
    content: ReactNode;
    key: string;
    options?: ModalOptions;
  } | null>(null);

  const openModal = useCallback((content: ReactNode, key = 'default', options?: ModalOptions) => {
    setModal((prev) => {
      if (prev?.key === key) {
        return { content, key, options };
      }
      return { content, key, options };
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeModal, modal]);

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
              className={joinClassName(
                'fixed inset-0 z-50 flex justify-center bg-black/60',
                modal.options?.placement === 'center' ? 'items-center' : 'items-end',
                modal.options?.overlayClassName,
              )}
              onClick={closeModal}
            >
              <motion.div
                initial={modal.options?.placement === 'center' ? { scale: 0.96, opacity: 0 } : { y: '100%' }}
                animate={modal.options?.placement === 'center' ? { scale: 1, opacity: 1 } : { y: 0 }}
                exit={modal.options?.placement === 'center' ? { scale: 0.96, opacity: 0 } : { y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={joinClassName(
                  'w-full max-w-lg rounded-t-2xl bg-[#16213e] p-4',
                  modal.options?.placement === 'center' && 'rounded-2xl',
                  modal.options?.panelClassName,
                )}
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
