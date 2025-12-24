'use client';

import { forwardRef } from 'react';
import styles from './Input.module.scss';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  fullWidth = false,
  icon,
  type = 'text',
  ...props 
}, ref) => {
  const inputClasses = [
    styles.input,
    error && styles['input--error'],
    icon && styles['input--with-icon'],
    fullWidth && styles['input--full-width'],
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.inputWrapper} ${fullWidth ? styles['inputWrapper--full-width'] : ''}`}>
      {label && (
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <span className={styles.errorMessage}>{error}</span>
      )}
      
      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
