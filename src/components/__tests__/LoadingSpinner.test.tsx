import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading text" />);
    expect(screen.getByText('Custom loading text')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-4 h-4');

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('w-8 h-8');
  });

  it('renders with different colors', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-blue-600');

    rerender(<LoadingSpinner color="white" />);
    expect(screen.getByRole('img', { hidden: true })).toHaveClass('text-white');
  });
});

