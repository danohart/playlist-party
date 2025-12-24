import styles from './Card.module.scss';

export default function Card({ 
  children, 
  hoverable = false,
  padding = 'normal',
  className = '',
  onClick,
  ...props 
}) {
  const classNames = [
    styles.card,
    styles[`card--padding-${padding}`],
    hoverable && styles['card--hoverable'],
    onClick && styles['card--clickable'],
    className,
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={classNames}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}
