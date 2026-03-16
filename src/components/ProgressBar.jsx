import { clsx } from 'clsx';
import './ProgressBar.css';

function ProgressBar({ progress = 0, className, size = 'md' }) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={clsx('progress-bar-container', `progress-bar-${size}`, className)}>
      <div 
        className="progress-bar-fill"
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}

export default ProgressBar;
