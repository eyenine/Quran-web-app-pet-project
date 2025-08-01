import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { AppProvider } from '../../context';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

// Mock the DailyAyah component
jest.mock('../../components', () => ({
  ...jest.requireActual('../../components'),
  DailyAyah: () => <div data-testid="daily-ayah">Daily Ayah Component</div>
}));

describe('HomePage', () => {
  it('renders welcome message', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Welcome to the Qur\'an Web App')).toBeInTheDocument();
  });

  it('renders daily ayah component', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByTestId('daily-ayah')).toBeInTheDocument();
  });

  it('renders quick action links', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Browse Surahs')).toBeInTheDocument();
    expect(screen.getByText('Search Verses')).toBeInTheDocument();
    expect(screen.getByText('My Bookmarks')).toBeInTheDocument();
  });

  it('renders getting started section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('📱 Mobile Friendly')).toBeInTheDocument();
    expect(screen.getByText('🎧 Audio Recitation')).toBeInTheDocument();
    expect(screen.getByText('🌍 Multiple Languages')).toBeInTheDocument();
    expect(screen.getByText('🌙 Dark Mode')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    renderWithProviders(<HomePage />);
    
    const browseLink = screen.getByText('Browse Surahs').closest('a');
    const searchLink = screen.getByText('Search Verses').closest('a');
    const bookmarksLink = screen.getByText('My Bookmarks').closest('a');
    
    expect(browseLink).toHaveAttribute('href', '/surah/1');
    expect(searchLink).toHaveAttribute('href', '/search');
    expect(bookmarksLink).toHaveAttribute('href', '/bookmarks');
  });
});