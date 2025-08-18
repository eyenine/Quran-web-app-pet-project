import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { trackPageView } from './services/analytics';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality (production only)
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if ('serviceWorker' in navigator) {
  // In development, unregister any existing service workers to prevent stale code
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
    // Optionally clear caches to force latest assets
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
    console.log('Service workers unregistered for development.');
  });
}

// Track initial page view
trackPageView(window.location.pathname, document.title);

// Track route changes
let currentPath = window.location.pathname;
const observer = new MutationObserver(() => {
  if (window.location.pathname !== currentPath) {
    currentPath = window.location.pathname;
    trackPageView(currentPath, document.title);
  }
});

observer.observe(document, { subtree: true, childList: true });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals((metric) => {
  // Track performance metrics
  console.log('Performance metric:', metric);
  
  // You can send these metrics to your analytics service
  // Example: sendToAnalytics(metric);
});
