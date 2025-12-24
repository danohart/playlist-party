'use client';

import { forwardRef } from 'react';
import styles from './DateTimePicker.module.scss';

const DateTimePicker = forwardRef(({ 
  label,
  error,
  helperText,
  fullWidth = false,
  type = 'datetime-local',
  min,
  max,
  ...props 
}, ref) => {
  const inputClasses = [
    styles.input,
    error && styles['input--error'],
    fullWidth && styles['input--full-width'],
  ].filter(Boolean).join(' ');

  return (
    <div className={`${styles.datePickerWrapper} ${fullWidth ? styles['datePickerWrapper--full-width'] : ''}`}>
      {label && (
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        min={min}
        max={max}
        className={inputClasses}
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

DateTimePicker.displayName = 'DateTimePicker';

export default DateTimePicker;
