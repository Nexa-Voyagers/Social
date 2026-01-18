'use client';

import { useState, useEffect } from 'react';

export function DemoModeBanner() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || backendStatus === 'online') return null;

  if (backendStatus === 'checking') {
    return (
      <div className="bg-gray-600 text-white px-4 py-3">
        <div className="container mx-auto text-center">
          <p className="font-semibold">🔍 Checking backend connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Backend API Not Connected</p>
            <p className="text-sm text-red-100">
              Deploy the backend server to enable all features. Check SETUP.md for deployment instructions.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-red-100 font-bold text-xl px-3"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
