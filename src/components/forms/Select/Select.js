'use client';

import { forwardRef } from 'react';
import styles from './Select.module.scss';

const Select = forwardRef(({ 
  label,
  error,
  helperText,
  fullWidth = false,
  options = [],
  placeholder = 'Select an option',
  ...props 
}, ref) => {
  const selectClasses = [
    styles.select,
    error && styles['select--error'],
    fullWidth && styles['select--full-width'],
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.selectWrapper} ${fullWidth ? styles['selectWrapper--full-width'] : ''}`}>
      {label && (
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.selectContainer}>
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow}>▼</span>
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

Select.displayName = 'Select';

export default Select;
