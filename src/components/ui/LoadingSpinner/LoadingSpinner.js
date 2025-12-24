import styles from './LoadingSpinner.module.scss';

export default function LoadingSpinner({ 
  size = 'medium',
  color = 'primary',
  centered = false,
}) {
  const classNames = [
    styles.spinner,
    styles[`spinner--${size}`],
    styles[`spinner--${color}`],
    centered && styles['spinner--centered'],
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames}>
      <div className={styles.spinnerCircle}></div>
    </div>
  );
}
