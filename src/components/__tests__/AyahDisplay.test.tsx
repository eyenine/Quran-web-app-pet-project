import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AyahDisplay } from '../quran/AyahDisplay';
import { AppProvider } from '../../context';
import { Ayah } from '../../types';

const mockAyah: Ayah = {
  id: 1,
  surahId: 1,
  ayahNumber: 1,
  arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  english: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
  bangla: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে।',
  audioUrl: 'https://example.com/audio.mp3',
  juzNumber: 1
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('AyahDisplay', () => {
  it('renders Arabic text correctly', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    expect(screen.getByText(mockAyah.arabic)).toBeInTheDocument();
  });

  it('renders English translation', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    expect(screen.getByText(mockAyah.english)).toBeInTheDocument();
  });

  it('shows ayah number', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('has audio play button', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    const audioButton = screen.getByLabelText(/play audio/i);
    expect(audioButton).toBeInTheDocument();
  });

  it('has bookmark button', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    const bookmarkButton = screen.getByLabelText(/add bookmark/i);
    expect(bookmarkButton).toBeInTheDocument();
  });

  it('has copy button', () => {
    renderWithProvider(<AyahDisplay ayah={mockAyah} />);
    
    const copyButton = screen.getByLabelText(/copy verse/i);
    expect(copyButton).toBeInTheDocument();
  });

  it('shows surah info when enabled', () => {
    renderWithProvider(
      <AyahDisplay 
        ayah={mockAyah} 
        surahName="Al-Fatihah" 
        showSurahInfo={true} 
      />
    );
    
    expect(screen.getByText('Al-Fatihah')).toBeInTheDocument();
    expect(screen.getByText(/Verse 1 • Juz 1/)).toBeInTheDocument();
  });
});