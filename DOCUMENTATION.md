# Quran Web App - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Component Documentation](#component-documentation)
7. [State Management](#state-management)
8. [Performance Optimizations](#performance-optimizations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)
11. [Development Guidelines](#development-guidelines)
12. [Troubleshooting](#troubleshooting)

## Overview

The Quran Web App is a modern, responsive web application built with React and TypeScript that provides users with a comprehensive Quran reading experience. The app features Arabic text, multiple translations, audio recitations, bookmarking, search functionality, and more.

### Key Features

- 📖 Complete Quran with Arabic text and translations
- 🎧 Audio recitations with per-verse controls
- 🔍 Advanced search functionality
- 🔖 Bookmarking system
- 🌙 Dark/Light theme support
- 🌍 Multilingual support (English & Bengali)
- 📱 Progressive Web App (PWA) capabilities
- ⚡ Offline support with service worker
- 📊 Analytics and error tracking
- 🎯 Accessibility features

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Interface│    │   State Management│    │   External APIs │
│   (React/TSX)   │◄──►│   (Context API)  │◄──►│   (Quran.com)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Service Worker│    │   Local Storage │    │   Audio CDN     │
│   (PWA/Cache)   │    │   (Bookmarks)   │    │   (Recitations) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

The app follows a hierarchical component structure:

```
App
├── AppProvider (Context)
├── ErrorBoundary
├── AppLayout
│   ├── Header
│   ├── Sidebar
│   ├── Main Content
│   └── Footer (Audio Player)
└── Pages
    ├── HomePage
    ├── SurahPage
    ├── SearchPage
    ├── BookmarksPage
    └── SettingsPage
```

## Technology Stack

### Frontend
- **React 19.1.1** - UI library
- **TypeScript 4.9.5** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **React Router 7.7.1** - Routing
- **Fuse.js 7.1.0** - Fuzzy search

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **React Testing Library** - Component testing

### Performance & Monitoring
- **Service Worker** - PWA & caching
- **Web Vitals** - Performance monitoring
- **Custom Analytics** - User behavior tracking

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── audio/           # Audio player components
│   ├── bookmarks/       # Bookmark management
│   ├── common/          # Shared components
│   ├── daily/           # Daily Ayah feature
│   ├── layout/          # Layout components
│   ├── quran/           # Quran display components
│   └── search/          # Search functionality
├── context/             # React Context providers
├── pages/               # Route components
├── services/            # API and utility services
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── App.tsx             # Main application
```

## API Documentation

### Quran.com API Integration

The app integrates with the Quran.com API for fetching Quran data.

#### Base Configuration
```typescript
const API_BASE_URL = 'https://api.quran.com/api/v4';
const TRANSLATION_IDS = {
  english: 20,  // Sahih International
  bangla: 161,  // Muhiuddin Khan
};
```

#### Key Endpoints

**Fetch All Surahs**
```typescript
GET /chapters
Response: { chapters: QuranApiChapter[] }
```

**Fetch Surah Verses**
```typescript
GET /verses/by_chapter/{surahId}?translations={translationIds}
Response: { verses: QuranApiVerse[] }
```

**Fetch Single Verse**
```typescript
GET /verses/by_key/{surahId}:{ayahNumber}
Response: { verse: QuranApiVerse }
```

#### Caching Strategy

- **Surah List**: 24 hours
- **Verses**: 1 hour
- **Translations**: 1 hour
- **Service Worker**: Static assets cached indefinitely

### Audio API

**Verse Audio URL Format**
```
https://verses.quran.com/Alafasy/mp3/{paddedSurah}{paddedAyah}.mp3
```

**Surah Audio URL Format**
```
https://download.quranicaudio.com/quran/mishary_rashid_alafasy/{paddedSurah}.mp3
```

## Component Documentation

### Core Components

#### AyahDisplay
Displays individual Quran verses with translations and controls.

**Props:**
```typescript
interface AyahDisplayProps {
  ayah: Ayah;
  surahName?: string;
  showSurahInfo?: boolean;
  className?: string;
}
```

**Features:**
- Arabic text display
- Translation rendering
- Audio playback controls
- Bookmark functionality
- Copy to clipboard
- Accessibility support

#### AppLayout
Main layout wrapper providing consistent structure.

**Features:**
- Responsive sidebar
- Header with navigation
- Footer with audio player
- Keyboard navigation
- Focus management

### Context Providers

#### AppProvider
Root context provider combining all app state.

#### ThemeContext
Manages light/dark theme state.

#### LanguageContext
Manages translation language preferences.

#### BookmarkContext
Manages user bookmarks with localStorage persistence.

#### AudioContext
Manages audio playback state and controls.

## State Management

### Context API Structure

```typescript
// Theme State
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Language State
interface LanguageState {
  language: 'english' | 'bangla' | 'both';
  setLanguage: (lang: string) => void;
  isEnglishEnabled: boolean;
  isBanglaEnabled: boolean;
}

// Bookmark State
interface BookmarkState {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (ayahId: number) => void;
  isBookmarked: (ayahId: number) => boolean;
}

// Audio State
interface AudioState {
  isPlaying: boolean;
  currentAyahId: number | null;
  isLoading: boolean;
  error: string | null;
  playAyah: (ayahId: number, audioUrl: string) => Promise<void>;
}
```

### Data Flow

1. **User Action** → Component
2. **Component** → Context Hook
3. **Context Hook** → State Update
4. **State Update** → UI Re-render
5. **Side Effects** → API calls, localStorage updates

## Performance Optimizations

### Code Splitting
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports for heavy components

### Caching Strategy
- Service Worker for static assets
- API response caching
- localStorage for user preferences
- Memory caching for frequently accessed data

### Bundle Optimization
- Tree shaking
- Dead code elimination
- Image optimization
- Font loading optimization

### Rendering Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Virtual scrolling for large lists

## Testing Strategy

### Testing Pyramid

```
    E2E Tests (Cypress)
        ▲
   Integration Tests
        ▲
   Unit Tests (Jest/RTL)
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main user journeys

### Testing Tools
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Cypress**: E2E testing

### Example Test Structure

```typescript
describe('AyahDisplay', () => {
  it('renders Arabic text correctly', () => {
    render(<AyahDisplay ayah={mockAyah} />);
    expect(screen.getByText(mockAyah.arabic)).toBeInTheDocument();
  });

  it('plays audio when play button is clicked', async () => {
    render(<AyahDisplay ayah={mockAyah} />);
    fireEvent.click(screen.getByLabelText('Play audio'));
    expect(mockPlayAyah).toHaveBeenCalledWith(mockAyah.id, mockAyah.audioUrl);
  });
});
```

## Deployment Guide

### Prerequisites
- Node.js 18+
- npm or yarn
- Vercel account (for hosting)

### Environment Variables

Create `.env.local` for local development:
```env
REACT_APP_API_BASE_URL=https://api.quran.com/api/v4
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_ENVIRONMENT=development
```

### Build Process

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Tests**
   ```bash
   npm test
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   ```bash
   npm run deploy
   ```

### CI/CD Pipeline

The app uses GitHub Actions for automated deployment:

1. **Push to develop** → Deploy to staging
2. **Push to main** → Deploy to production
3. **Pull Request** → Run tests and checks

### Performance Monitoring

- **Lighthouse CI**: Automated performance testing
- **Web Vitals**: Core Web Vitals tracking
- **Custom Analytics**: User behavior insights

## Development Guidelines

### Code Style

**TypeScript**
- Strict mode enabled
- Explicit return types for functions
- Interface over type aliases
- Proper error handling

**React**
- Functional components with hooks
- Props interface definitions
- Proper component composition
- Accessibility considerations

**CSS/Tailwind**
- Utility-first approach
- Consistent spacing scale
- Dark mode support
- Responsive design

### Git Workflow

1. **Feature Branches**: `feature/feature-name`
2. **Bug Fixes**: `fix/bug-description`
3. **Hotfixes**: `hotfix/urgent-fix`
4. **Commits**: Conventional commits format

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Tests are included and passing
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Documentation updated
- [ ] Code follows style guide

### Performance Guidelines

- Lazy load non-critical components
- Optimize bundle size
- Use proper caching strategies
- Monitor Core Web Vitals
- Implement proper error boundaries

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Service Worker Issues**
```bash
# Clear service worker cache
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

**Audio Playback Issues**
- Check browser autoplay policies
- Verify audio file URLs
- Check network connectivity

**Performance Issues**
- Run Lighthouse audit
- Check bundle analyzer
- Monitor memory usage
- Review API response times

### Debug Tools

- **React DevTools**: Component inspection
- **Redux DevTools**: State debugging
- **Lighthouse**: Performance auditing
- **Chrome DevTools**: Network and performance

### Support

For technical support:
1. Check the troubleshooting guide
2. Review GitHub issues
3. Create a new issue with detailed information
4. Include browser console logs and error messages

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to submit pull requests, report bugs, and suggest features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 