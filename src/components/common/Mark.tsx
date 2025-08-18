// Mark Component for highlighting search results
import React from 'react';

interface MarkProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const Mark: React.FC<MarkProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800',
}) => {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          return (
            <mark key={index} className={`${highlightClassName} px-1 rounded`}>
              {part}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
};

