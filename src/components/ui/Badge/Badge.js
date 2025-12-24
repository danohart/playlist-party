import styles from './Badge.module.scss';

export default function Badge({ 
  children, 
  variant = 'default',
  size = 'medium',
}) {
  const classNames = [
    styles.badge,
    styles[`badge--${variant}`],
    styles[`badge--${size}`],
  ].filter(Boolean).join(' ');

  return (
    <span className={classNames}>
      {children}
    </span>
  );
}
