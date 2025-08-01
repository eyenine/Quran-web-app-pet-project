import React from 'react';

interface AudioProgressProps {
  progress: number;
  duration: number;
  onSeek: (progress: number) => void;
  disabled?: boolean;
}

export const AudioProgress: React.FC<AudioProgressProps> = ({
  progress,
  duration,
  onSeek,
  disabled = false
}) => {
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      const newTime = parseFloat(e.target.value);
      onSeek(newTime);
    }
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-2 w-full">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
        {formatTime(progress)}
      </span>
      
      <div className="flex-1 relative">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={handleSeek}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, #E5E7EB ${progressPercentage}%, #E5E7EB 100%)`
          }}
        />
      </div>
      
      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
        {formatTime(duration)}
      </span>
    </div>
  );
}; 