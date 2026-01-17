'use client';

import { useState, useEffect } from 'react';

export function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    setIsDemoMode(apiUrl.includes('localhost'));
  }, []);

  if (!isDemoMode || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎮</span>
          <div>
            <p className="font-semibold">Demo Mode Active</p>
            <p className="text-sm text-blue-100">
              Data is stored locally in your browser. Connect a backend to enable full features.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-blue-100 font-bold text-xl px-3"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
