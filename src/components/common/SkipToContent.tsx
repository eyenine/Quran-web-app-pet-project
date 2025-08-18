import React, { useState, useEffect } from 'react';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show skip link when Tab is pressed
      if (event.key === 'Tab') {
        setIsVisible(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Hide skip link when Tab is released
      if (event.key === 'Tab') {
        setIsVisible(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className={`
        fixed top-4 left-4 z-50
        bg-blue-600 hover:bg-blue-700 text-white
        px-4 py-2 rounded-md shadow-lg
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transform -translate-y-full opacity-0
        ${isVisible ? 'translate-y-0 opacity-100' : ''}
        ${className}
      `}
      aria-label={`Skip to main content (${targetId})`}
    >
      Skip to content
    </button>
  );
};

// Alternative implementation that's always visible but hidden off-screen
export const SkipToContentAlways: React.FC<SkipToContentProps> = ({
  targetId = 'main-content',
  className = '',
}) => {
  const handleClick = () => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        absolute -top-12 left-4 z-50
        bg-blue-600 hover:bg-blue-700 text-white
        px-4 py-2 rounded-md shadow-lg
        transition-all duration-200 ease-in-out
        focus:top-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Skip to main content (${targetId})`}
    >
      Skip to content
    </button>
  );
};

// Hook for managing focus
export function useFocusManagement() {
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const focusFirstInteractive = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      const interactiveElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (interactiveElements.length > 0) {
        (interactiveElements[0] as HTMLElement).focus();
      }
    }
  };

  const trapFocus = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  };

  return {
    focusElement,
    focusFirstInteractive,
    trapFocus,
  };
}

// Default export
export default SkipToContent;

