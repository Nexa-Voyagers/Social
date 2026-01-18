'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { platformAccountsApi } from '@/lib/api';

interface PlatformAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'gmb' | 'youtube';
  accountName: string;
  accountUsername: string;
  isActive: boolean;
  lastVerified: string;
}

const PLATFORM_INFO = {
  facebook: {
    name: 'Facebook Pages',
    icon: '📘',
    color: 'bg-blue-600',
    description: 'Connect your Facebook Page to auto-post',
    requirements: [
      'Facebook Business Page (not personal profile)',
      'Page admin access',
      'Meta Business account'
    ]
  },
  instagram: {
    name: 'Instagram Business',
    icon: '📸',
    color: 'bg-pink-600',
    description: 'Connect Instagram Business account for posts, stories & reels',
    requirements: [
      'Instagram Business or Creator account',
      'Must be linked to a Facebook Page',
      'Business account required for API posting'
    ]
  },
  linkedin: {
    name: 'LinkedIn Company Page',
    icon: '💼',
    color: 'bg-blue-700',
    description: 'Connect your LinkedIn Company Page',
    requirements: [
      'LinkedIn Company Page (not personal profile)',
      'Page admin access',
      'LinkedIn Marketing Developer Platform access'
    ]
  },
  gmb: {
    name: 'Google Business Profile',
    icon: '🔍',
    color: 'bg-red-600',
    description: 'Connect Google My Business for local posts',
    requirements: [
      'Verified Google Business Profile',
      'Location manager access',
      'Google My Business API access'
    ]
  },
  youtube: {
    name: 'YouTube Channel',
    icon: '🎥',
    color: 'bg-red-500',
    description: 'Connect YouTube for video uploads and Shorts',
    requirements: [
      'YouTube Channel',
      'Channel ownership',
      'YouTube Data API v3 access'
    ]
  }
};

export function PlatformsTab({ clientId }: { clientId: string }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await platformAccountsApi.getByClient(clientId);
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch platform accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = async (platform: string) => {
    setConnecting(platform);
    try {
      // Get OAuth URL from backend
      const response = await platformAccountsApi.connect(clientId, platform);
      const oauthUrl = response.data.data.oauthUrl;

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        oauthUrl,
        `Connect ${platform}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for OAuth callback
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'oauth-success') {
          fetchAccounts();
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

    } catch (error) {
      console.error('Failed to connect platform:', error);
      alert('Failed to connect platform. Please ensure the backend is running and OAuth is configured.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string, platform: string) => {
    if (!confirm(`Disconnect ${platform}? You can reconnect anytime.`)) return;

    try {
      await platformAccountsApi.disconnect(accountId);
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
      alert('Failed to disconnect platform. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading platforms...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Social Media Connections</h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect platforms to enable automatic posting
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Important Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Backend Required</h4>
          <p className="text-sm text-yellow-800 mb-3">
            Platform connections require the backend API server to be deployed with proper OAuth credentials.
          </p>
          <ul className="space-y-1 text-sm text-yellow-800">
            <li>✅ Backend must be running at the API_URL</li>
            <li>✅ OAuth apps must be created for each platform</li>
            <li>✅ Redirect URLs must be configured</li>
            <li>✅ API keys must be set in environment variables</li>
          </ul>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Connected Accounts</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${PLATFORM_INFO[account.platform].color} flex items-center justify-center text-2xl`}>
                      {PLATFORM_INFO[account.platform].icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {PLATFORM_INFO[account.platform].name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        @{account.accountUsername} • {account.accountName}
                      </p>
                      <p className="text-xs text-green-700">
                        ✓ Connected • Last verified: {new Date(account.lastVerified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleDisconnect(account.id, account.platform)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PLATFORM_INFO).map(([key, info]) => {
          const isConnected = accounts.some(a => a.platform === key);

          return (
            <Card key={key} className={isConnected ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-lg ${info.color} flex items-center justify-center text-3xl`}>
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{info.name}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {info.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleConnect(key)}
                  disabled={isConnected || connecting === key}
                  className={`w-full ${info.color} text-white`}
                >
                  {connecting === key ? 'Connecting...' : isConnected ? '✓ Connected' : `Connect ${info.name}`}
                </Button>

                {key === 'instagram' && (
                  <p className="text-xs text-gray-500 italic">
                    Note: Instagram must be connected through Facebook first
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Setup Guide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-blue-900">🚀 How to Set Up OAuth Connections</h3>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">1. Deploy the Backend</h4>
            <p>The backend server in <code className="bg-blue-100 px-1 rounded">/backend</code> must be deployed and running.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Create OAuth Apps</h4>
            <ul className="space-y-2 ml-4">
              <li>• Facebook: Create app at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a></li>
              <li>• LinkedIn: Create app at <a href="https://www.linkedin.com/developers" target="_blank" rel="noopener noreferrer" className="underline">linkedin.com/developers</a></li>
              <li>• Google (GMB + YouTube): Create project at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Configure Environment Variables</h4>
            <p>Add OAuth credentials to backend <code className="bg-blue-100 px-1 rounded">.env</code> file:</p>
            <pre className="bg-blue-100 p-3 rounded mt-2 text-xs overflow-x-auto">
{`FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Set Redirect URLs</h4>
            <p>In each OAuth app, add the callback URL: <code className="bg-blue-100 px-1 rounded">https://your-backend.com/api/auth/callback</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
