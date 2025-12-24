'use client';

import { useEffect } from 'react';
import styles from './Modal.module.scss';

export default function Modal({ 
  isOpen, 
  onClose, 
  title,
  children,
  size = 'medium',
  showCloseButton = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${styles[`modalContent--${size}`]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {showCloseButton && (
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        
        {title && (
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
        )}
        
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}
