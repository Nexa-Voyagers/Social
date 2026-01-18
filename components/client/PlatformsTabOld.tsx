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

export function PlatformsTab({ clientId }: { clientId: string }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await platformAccountsApi.connect(clientId, platform);
      // This would typically redirect to OAuth flow
      alert(`OAuth flow for ${platform} would be initiated here. This feature requires backend OAuth setup.`);
    } catch (error) {
      console.error('Failed to connect platform:', error);
      alert('Failed to connect platform. Please try again.');
    }
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await platformAccountsApi.disconnect(accountId);
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
      alert('Failed to disconnect platform. Please try again.');
    }
  };

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { id: 'gmb', name: 'Google My Business', icon: '📍', color: 'bg-red-600' },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'bg-red-500' }
  ];

  if (loading) {
    return <div className="text-gray-500">Loading platforms...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Connected Platforms</h2>
        <p className="text-sm text-gray-500">
          Connect social media accounts to enable automated posting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connectedAccount = accounts.find((acc) => acc.platform === platform.id);

          return (
            <Card key={platform.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      {connectedAccount ? (
                        <div>
                          <p className="text-sm text-gray-600">
                            @{connectedAccount.accountUsername || connectedAccount.accountName}
                          </p>
                          <p className="text-xs text-green-600">
                            ✓ Connected
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {connectedAccount ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDisconnect(connectedAccount.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Setup Instructions</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📘 Facebook & Instagram</h4>
            <p className="text-sm text-gray-600">
              Requires Meta Business account and app credentials. You&apos;ll need to create a Facebook app
              and configure OAuth redirects.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">💼 LinkedIn</h4>
            <p className="text-sm text-gray-600">
              Requires LinkedIn Developer app with proper permissions (w_member_social, w_organization_social).
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📍 Google My Business</h4>
            <p className="text-sm text-gray-600">
              Requires Google Cloud project with My Business API enabled and OAuth credentials.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">▶️ YouTube</h4>
            <p className="text-sm text-gray-600">
              Requires YouTube Data API v3 enabled in Google Cloud Console.
            </p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              📚 For detailed setup instructions, see the <strong>SETUP.md</strong> file in your repository.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
