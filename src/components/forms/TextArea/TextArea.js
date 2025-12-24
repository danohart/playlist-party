'use client';

import { forwardRef } from 'react';
import styles from './TextArea.module.scss';

const TextArea = forwardRef(({ 
  label,
  error,
  helperText,
  fullWidth = false,
  rows = 4,
  maxLength,
  showCount = false,
  ...props 
}, ref) => {
  const textareaClasses = [
    styles.textarea,
    error && styles['textarea--error'],
    fullWidth && styles['textarea--full-width'],
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.textareaWrapper} ${fullWidth ? styles['textareaWrapper--full-width'] : ''}`}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
          {showCount && maxLength && (
            <span className={styles.counter}>
              {props.value?.length || 0}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
      
      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
