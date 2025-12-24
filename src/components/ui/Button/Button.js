import styles from './Button.module.scss';

export default function Button({ 
  children, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  ...props 
}) {
  const classNames = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth && styles['button--full-width'],
    loading && styles['button--loading'],
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classNames}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner}></span>
      ) : (
        children
      )}
    </button>
  );
}
