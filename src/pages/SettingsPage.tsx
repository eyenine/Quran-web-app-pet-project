import React, { useState } from 'react';
import { useTheme, useLanguage, useNotes } from '../context';
import { analytics } from '../services/analytics';
import { trackPreferenceChange } from '../analytics/events';
import { clearAnalyticsEvents, exportAnalyticsData } from '../services/analytics';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { notes, remove } = useNotes();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const handleThemeChange = () => {
    toggleTheme();
          trackPreferenceChange('theme', 'theme', theme === 'light' ? 'dark' : 'light', theme);
  };

  const handleLanguageChange = (newLanguage: 'english' | 'bangla' | 'both') => {
    setLanguage(newLanguage);
          trackPreferenceChange('language', 'language', newLanguage, language);
  };

  const clearAnalyticsData = () => {
    clearAnalyticsEvents();
    alert('Analytics data cleared successfully');
  };

  const handleExportAnalyticsData = () => {
    const data = exportAnalyticsData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    sessionStorage.clear();
    localStorage.removeItem('quran_');
    alert('Cache cleared successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your Quran reading experience
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose between light and dark mode
              </p>
            </div>
            <button
              onClick={handleThemeChange}
              className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              style={{
                backgroundColor: theme === 'dark' ? '#0C1A1A' : '#e5e7eb'
              }}
            >
                              <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
            </button>
          </div>

          {/* Language Settings */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Translation Language</h3>
            <div className="space-y-2">
              {[
                { value: 'english', label: 'English Only' },
                { value: 'bangla', label: 'Bengali Only' },
                { value: 'both', label: 'Both Languages' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="language"
                    value={option.value}
                    checked={language === option.value}
                    onChange={() => handleLanguageChange(option.value as any)}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Data & Privacy
        </h2>
        
        <div className="space-y-4">
          {/* Analytics Toggle - Disabled for now */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Help us improve by sharing usage data
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Always enabled
            </div>
          </div>

          {/* Cache Management */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Clear Cache</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Free up storage space and refresh data
              </p>
            </div>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Notes Manager */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notes Manager
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">View and manage your saved verse notes.</p>
        {notes.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No notes saved yet. Open any verse and click the pen icon to add a note.</div>
        ) : (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={`${n.surahId}:${n.ayahNumber}`} className="p-3 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{n.surahId}:{n.ayahNumber}</div>
                  <button onClick={() => remove(n.surahId, n.ayahNumber)} className="text-xs text-red-600 dark:text-red-400">Delete</button>
                </div>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{n.content}</div>
                {n.tags && n.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 text-xs">
                    {n.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const data = JSON.stringify(notes, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `quran-notes-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-2 rounded bg-primary-600 text-white text-sm"
              >
                Export Notes
              </button>
              <button
                onClick={() => {
                  const w = window.open('', '_blank');
                  if (!w) return;
                  const dateStr = new Date().toLocaleString();
                  const rows = notes.map((n, idx) => `
                    <tr>
                      <td style="padding:8px;border:1px solid #ccc;vertical-align:top;">${idx + 1}</td>
                      <td style="padding:8px;border:1px solid #ccc;vertical-align:top;">${n.surahId}:${n.ayahNumber}</td>
                      <td style="padding:8px;border:1px solid #ccc;white-space:pre-wrap;">${(n.content || '').replace(/</g, '&lt;')}</td>
                      <td style="padding:8px;border:1px solid #ccc;vertical-align:top;">${(n.tags || []).join(', ')}</td>
                      <td style="padding:8px;border:1px solid #ccc;vertical-align:top;">${new Date(n.updatedAt).toLocaleString()}</td>
                    </tr>
                  `).join('');
                  const html = `
                    <html>
                      <head>
                        <title>Quran Notes Export</title>
                        <meta charset="utf-8" />
                        <style>
                          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
                          h1 { margin: 0 0 4px; font-size: 20px; }
                          .meta { color: #555; margin-bottom: 16px; font-size: 12px; }
                          table { width: 100%; border-collapse: collapse; font-size: 12px; }
                          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                          th { background: #f5f5f5; }
                        </style>
                      </head>
                      <body>
                        <h1>Quran Notes</h1>
                        <div class="meta">Exported on ${dateStr} • Total: ${notes.length}</div>
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Reference</th>
                              <th>Note</th>
                              <th>Tags</th>
                              <th>Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${rows}
                          </tbody>
                        </table>
                        <script>setTimeout(() => { window.print(); }, 100);</script>
                      </body>
                    </html>`;
                  w.document.open();
                  w.document.write(html);
                  w.document.close();
                }}
                className="px-3 py-2 rounded bg-gray-700 text-white text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Data (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Analytics Data (Development)
          </h2>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
              >
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </button>
              <button
                onClick={handleExportAnalyticsData}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={clearAnalyticsData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
              >
                Clear Data
              </button>
            </div>

            {showAnalytics && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-64">
                  {JSON.stringify(analytics.getAnalyticsData(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Debug Information
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </button>

            {showDebugInfo && (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4">
                <div className="space-y-2 text-sm">
                  <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                  <div><strong>Platform:</strong> {navigator.platform}</div>
                  <div><strong>Language:</strong> {navigator.language}</div>
                  <div><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</div>
                  <div><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}</div>
                  <div><strong>Local Storage:</strong> {typeof Storage !== 'undefined' ? 'Supported' : 'Not Supported'}</div>
                  <div><strong>Session Storage:</strong> {typeof sessionStorage !== 'undefined' ? 'Supported' : 'Not Supported'}</div>
                  <div><strong>Cache API:</strong> {'caches' in window ? 'Supported' : 'Not Supported'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          App Information
        </h2>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div><strong>Version:</strong> 1.0.0</div>
          <div><strong>Build Date:</strong> {new Date().toLocaleDateString()}</div>
          <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
          <div><strong>API Base URL:</strong> https://api.quran.com</div>
        </div>
      </div>
    </div>
  );
}; 