# Qur'an Web App ✨

A spiritual, multilingual, responsive Qur'an reader with beautiful UX and features that bring you closer to Allah.

## 🌟 Features

- 📖 **Complete Qur'an** - All 114 Surahs with Arabic text and translations
- 🎧 **Audio Recitation** - Per-Ayah audio playback with Mishary Rashid recitation
- 🔍 **Smart Search** - Search across Surah names and translations
- 🔖 **Bookmarking** - Save and organize your favorite verses
- 🌙 **Dark/Light Mode** - Comfortable reading in any lighting
- 🌍 **Multilingual** - English and Bengali translations
- 📱 **Mobile First** - Optimized for all devices
- ⚡ **Fast & Offline** - Cached data and service worker support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🛠️ Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run format` - Formats code with Prettier
- `npm run lint` - Runs ESLint
- `npm run lint:fix` - Fixes ESLint issues automatically
- `npm run analyze` - Analyzes bundle size
- `npm run deploy` - Deploys to Vercel

## 🧰 Tech Stack

- **Frontend**: React.js 18+ with TypeScript
- **Styling**: Tailwind CSS with custom Islamic design system
- **Routing**: React Router v6 with lazy loading
- **State Management**: React Context API
- **Data Source**: Quran.com API with caching
- **Audio**: Quran.com Audio CDN
- **Storage**: localStorage with error handling
- **Search**: Fuse.js for fuzzy search
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel with optimized configuration

## 📁 Project Structure

```
src/
├── components/
│   ├── audio/         # Audio player components
│   ├── bookmarks/     # Bookmark management
│   ├── common/        # Reusable UI components
│   ├── daily/         # Daily Ayah feature
│   ├── layout/        # App layout components
│   ├── quran/         # Qur'an display components
│   └── search/        # Search functionality
├── context/           # React Context providers
├── pages/             # Route components
├── services/          # API services
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── App.tsx           # Main application
```

## 🎨 Design System

- **Colors**: Islamic green (#0C1A1A) and gold (#D4AF37)
- **Typography**: Scheherazade New (Arabic), Lato (English), Noto Sans Bengali
- **Layout**: Mobile-first responsive design with Tailwind CSS
- **Accessibility**: WCAG 2.1 AA compliant

## ✅ Implementation Status

All 20 planned tasks have been completed:

1. ✅ Project setup and development environment
2. ✅ Core data models and TypeScript interfaces
3. ✅ Context API state management system
4. ✅ Core layout components
5. ✅ Quran.com API integration
6. ✅ Surah and Ayah display components
7. ✅ Audio playback functionality
8. ✅ Bookmark system
9. ✅ Search functionality
10. ✅ Navigation system
11. ✅ Theme system implementation
12. ✅ Language toggle functionality
13. ✅ Daily Ayah feature
14. ✅ Home page and main pages
15. ✅ Responsive mobile optimizations
16. ✅ Accessibility features
17. ✅ Error handling and loading states
18. ✅ Comprehensive tests
19. ✅ Performance optimizations
20. ✅ Production deployment configuration

## 🌐 Deployment

The app is optimized for deployment on Vercel:

1. **Environment Variables**: Copy `.env.example` to `.env.local` and configure
2. **Build**: Run `npm run build` to create production build
3. **Deploy**: Use `npm run deploy` or connect to Vercel GitHub integration

## 🤝 Contributing

This project follows spec-driven development. See `.kiro/specs/quran-web-app/` for:
- Requirements document
- Design specifications  
- Implementation tasks

## 📄 License

This project is created for spiritual and educational purposes. May Allah accept this effort and make it beneficial for the Ummah.

## 🤲 Du'a

*"Our Lord, give us good in this world and good in the next world, and save us from the punishment of the Fire."* - Qur'an 2:201