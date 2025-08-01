import React, { useState, useRef } from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={errorRef}
      className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className} ${isFocused ? 'ring-2 ring-red-400 dark:ring-red-500' : ''}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsFocused(false);
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-label="Error message"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0" role="img" aria-label="Error">
          <svg 
            className="w-5 h-5 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 
            className="text-sm font-medium text-red-800 dark:text-red-200"
          >
            {title}
          </h3>
          <p 
            className="mt-1 text-sm text-red-700 dark:text-red-300"
            aria-live="polite"
          >
            {message}
          </p>
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                role="button"
                aria-label="Retry action"
                tabIndex={0}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};