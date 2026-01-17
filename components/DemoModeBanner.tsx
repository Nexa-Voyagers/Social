'use client';

import { useState, useEffect } from 'react';

export function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [storageSize, setStorageSize] = useState('0 KB');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    setIsDemoMode(apiUrl.includes('localhost'));

    // Calculate storage usage
    if (typeof window !== 'undefined') {
      const calculateSize = () => {
        let total = 0;
        for (let key in localStorage) {
          if (key.startsWith('autoupload_')) {
            total += localStorage[key].length;
          }
        }
        const kb = (total / 1024).toFixed(2);
        setStorageSize(`${kb} KB`);
      };
      calculateSize();
      const interval = setInterval(calculateSize, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const clearDemoData = () => {
    if (confirm('Are you sure you want to clear all demo data? This cannot be undone.')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('autoupload_'));
      keys.forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  if (!isDemoMode || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🎮</span>
          <div>
            <p className="font-semibold">Demo Mode Active - All features working!</p>
            <p className="text-sm text-blue-100">
              Data stored locally in browser ({storageSize}) • Open Console (F12) for debug logs • All uploads work in-browser
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearDemoData}
            className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition-colors"
          >
            Clear Data
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-blue-100 font-bold text-xl px-3"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
