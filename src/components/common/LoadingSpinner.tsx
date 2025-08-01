import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  showProgress?: boolean;
  progress?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  type = 'spinner',
  showProgress = false,
  progress = 0,
  className = ''
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-pulse`}></div>
        );

      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`}></div>
            <div className={`${sizeClasses[size]} border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      
      {text && (
        <p className={`mt-3 text-gray-600 dark:text-gray-300 ${textSizes[size]} text-center`}>
          {text}
        </p>
      )}

      {showProgress && (
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Loading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized loading components for different contexts
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-primary-500">
    <LoadingSpinner size="large" text={text} />
  </div>
);

export const ContentLoader: React.FC<{ text?: string }> = ({ text = 'Loading content...' }) => (
  <div className="flex items-center justify-center py-12">
    <LoadingSpinner size="medium" text={text} />
  </div>
);

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center py-4">
    <LoadingSpinner size="small" text={text} />
  </div>
);

export const SkeletonLoader: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div 
        key={index}
        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
          index === lines - 1 ? 'w-4/6' : 'w-full'
        }`}
      ></div>
    ))}
  </div>
);

export const QuranSkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    {/* Surah header skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Ayah skeletons */}
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Arabic text skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        </div>
        
        {/* Translation skeletons */}
        <div className="space-y-4">
          <div className="border-l-4 border-gray-200 dark:border-gray-600 pl-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5 animate-pulse"></div>
          </div>
          <div className="border-l-4 border-gray-200 dark:border-gray-600 pl-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);