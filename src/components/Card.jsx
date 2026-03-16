import { clsx } from 'clsx';
import './Card.css';

function Card({ children, className, glow = false }) {
  return (
    <div className={clsx('wb-card glass', { 'wb-card-glow': glow }, className)}>
      {children}
    </div>
  );
}

export default Card;
