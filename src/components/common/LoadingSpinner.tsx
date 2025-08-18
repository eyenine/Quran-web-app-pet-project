import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
  showText?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600 dark:text-blue-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white',
    gray: 'text-gray-500 dark:text-gray-400',
  };

  const spinnerClasses = `${sizeClasses[size]} ${colorClasses[color]} animate-spin`;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      {(showText || text) && (
        <p className={`mt-2 text-sm ${colorClasses[color]} text-center`}>
          {text || 'Loading...'}
        </p>
      )}
    </div>
  );
};

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
  height = 'h-4',
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 dark:bg-gray-700 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

// Page loading component
interface PageLoadingProps {
  text?: string;
  showSpinner?: boolean;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading page...',
  showSpinner = true,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {showSpinner && (
          <LoadingSpinner size="xl" color="primary" className="mb-4" />
        )}
        <p className="text-lg text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
};

// Inline loading component
interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading...',
  size = 'sm',
}) => {
  return (
    <div className="inline-flex items-center space-x-2">
      <LoadingSpinner size={size} color="primary" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
};

// Button loading component
interface ButtonLoadingProps {
  text?: string;
  size?: 'sm' | 'md';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  text = 'Loading...',
  size = 'sm',
}) => {
  return (
    <div className="inline-flex items-center space-x-2">
      <LoadingSpinner size={size} color="white" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default LoadingSpinner;