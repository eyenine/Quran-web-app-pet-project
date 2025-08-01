# Quran Web App – Developer Documentation

## Overview
This document provides technical details and best practices for contributing to and maintaining the Quran Web App.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Key Technologies](#key-technologies)
- [Routing & SPA Behavior](#routing--spa-behavior)
- [Deployment](#deployment)
- [Testing](#testing)
- [Coding Standards](#coding-standards)
- [Troubleshooting](#troubleshooting)
- [Useful Scripts](#useful-scripts)

---

## Project Structure

```
quran-web-app/
├── public/               # Static assets, manifest, favicon, _redirects
├── src/                  # Main React source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components (Surah, Home, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context providers
│   ├── assets/           # Images, fonts, etc.
│   ├── App.tsx           # Main App entry
│   └── ...
├── build/                # Production build output
├── .github/              # GitHub Actions, templates
├── package.json          # Project metadata and scripts
└── ...
```

---

## Development Workflow
1. **Fork and clone the repo**
2. **Create a feature branch:**
   ```sh
git checkout -b feature/your-feature-name
```
3. **Write code and commit:**
   ```sh
git add .
git commit -m "Describe your change"
```
4. **Push and open a Pull Request**

---

## Key Technologies
- React 19 + TypeScript
- React Router DOM (SPA routing)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Fuse.js (search)
- React Hook Form (forms)
- HTML2Canvas (screenshots)
- gh-pages (GitHub Pages deployment)

---

## Routing & SPA Behavior
- Uses `BrowserRouter` from `react-router-dom`.
- For GitHub Pages, set `basename` to `/quran-web-app`.
- For Netlify root deployment, remove `basename`.
- Netlify requires a `_redirects` file in `public/` with:
  ```
  /*    /index.html   200
  ```
- All routes are handled client-side for a seamless SPA experience.

---

## Deployment
- **GitHub Pages:**
  - Set `homepage` in `package.json`.
  - Run `npm run deploy` (uses `gh-pages`).
- **Netlify:**
  - Ensure `_redirects` is present in `build/` after build.
  - Set publish directory to `build/` in Netlify dashboard.

---

## Testing
- Run `npm test` for unit tests.
- Add new tests for all components and hooks.
- Use [React Testing Library](https://testing-library.com/).

---

## Coding Standards
- Use Prettier for code formatting (`npm run format`).
- Use ESLint for linting (`npm run lint`).
- Write descriptive commit messages.
- Prefer functional components and hooks.

---

## Troubleshooting
- **Routing issues on Netlify:** Ensure `_redirects` exists in `build/`.
- **Deployment fails:** Check `homepage` in `package.json` and branch permissions.
- **Audio not working:** Confirm browser permissions and supported formats.

---

## Useful Scripts
- `npm run build` – Production build
- `npm run deploy` – Deploy to GitHub Pages
- `npm run lint` – Lint codebase
- `npm run format` – Format codebase
- `npm test` – Run tests

---

## Contact
For questions or support, open an issue or contact the maintainer via GitHub.
