import { clsx } from 'clsx';
import './Button.css';

function Button({ children, variant = 'primary', size = 'md', className, fullWidth, icon: Icon, onClick, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'wb-btn',
        `wb-btn-${variant}`,
        `wb-btn-${size}`,
        { 'wb-btn-full': fullWidth, 'wb-btn-disabled': disabled },
        className
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="wb-btn-icon" />}
      {children}
    </button>
  );
}

export default Button;
