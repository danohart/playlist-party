'use client';

import { useEffect, useState } from 'react';
import styles from './Toast.module.scss';

export default function Toast({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div 
      className={`${styles.toast} ${styles[`toast--${type}`]} ${isVisible ? styles['toast--visible'] : ''}`}
      role="alert"
    >
      <span className={styles.icon}>{icons[type]}</span>
      <span className={styles.message}>{message}</span>
      <button 
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
