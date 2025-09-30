import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', center = false }) => {
  const classNames = [
    'spinner',
    `spinner-${size}`,
    center && 'spinner-center',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <div className="spinner-circle"></div>
    </div>
  );
};
