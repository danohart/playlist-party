'use client';

import { forwardRef } from 'react';
import styles from './Toggle.module.scss';

const Toggle = forwardRef(({ 
  label,
  helperText,
  disabled = false,
  ...props 
}, ref) => {
  return (
    <div className={styles.toggleWrapper}>
      <label className={`${styles.toggleLabel} ${disabled ? styles['toggleLabel--disabled'] : ''}`}>
        <input
          ref={ref}
          type="checkbox"
          className={styles.toggleInput}
          disabled={disabled}
          {...props}
        />
        <span className={styles.toggleSlider}></span>
        {label && (
          <span className={styles.labelText}>{label}</span>
        )}
      </label>
      {helperText && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;
