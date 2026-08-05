"use client";

import { ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  footer?: ReactNode;
  preventClose?: boolean;
  onCloseAttempt?: () => void;
}

export function AdminModal({ 
  open, 
  onClose, 
  title, 
  children, 
  maxWidth = "600px", 
  footer,
  preventClose = false,
  onCloseAttempt 
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (preventClose) {
          onCloseAttempt?.();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, preventClose, onClose, onCloseAttempt]);

  const handleBackdropClick = () => {
    if (preventClose) {
      onCloseAttempt?.();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="admin-modal-overlay" onClick={handleBackdropClick}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="admin-modal"
            style={{ maxWidth }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="admin-modal-header">
                <h3 className="text-[15px] font-semibold" style={{ color: "var(--admin-ink)" }}>
                  {title}
                </h3>
                <button 
                  onClick={() => preventClose ? onCloseAttempt?.() : onClose()} 
                  className="admin-icon-btn" 
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="admin-modal-body">{children}</div>
            {footer && <div className="admin-modal-footer">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
