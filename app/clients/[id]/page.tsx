'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { clientsApi, assetsApi, calendarApi, platformAccountsApi } from '@/lib/api';
import { AssetsTab } from '@/components/client/AssetsTab';
import { CalendarTab } from '@/components/client/CalendarTab';
import { PlatformsTab } from '@/components/client/PlatformsTab';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
  industry: string;
  website: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'calendar' | 'platforms'>('overview');

  const fetchClient = useCallback(async () => {
    try {
      const response = await clientsApi.getById(clientId);
      setClient(response.data.data);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      alert('Client not found');
      router.push('/clients');
    } finally {
      setLoading(false);
    }
  }, [clientId, router]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading || !client) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading client...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/clients')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={client.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: client.branding.primaryColor }}
              >
                {client.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-gray-500">{client.industry}</p>
            </div>
          </div>
          <Button onClick={() => router.push(`/clients/${clientId}/edit`)}>
            Edit Client
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'assets', label: 'Assets', icon: '🖼️' },
              { id: 'calendar', label: 'Content Calendar', icon: '📅' },
              { id: 'platforms', label: 'Platforms', icon: '🌐' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <OverviewTab client={client} />
          )}
          {activeTab === 'assets' && (
            <AssetsTab clientId={clientId} />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab clientId={clientId} clientName={client.name} />
          )}
          {activeTab === 'platforms' && (
            <PlatformsTab clientId={clientId} />
          )}
        </div>
      </div>
    </Layout>
  );
}

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Client Information</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {client.email && (
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{client.email}</p>
            </div>
          )}
          {client.phone && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{client.phone}</p>
            </div>
          )}
          {client.website && (
            <div>
              <label className="text-sm font-medium text-gray-500">Website</label>
              <a
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {client.website}
              </a>
            </div>
          )}
          {client.industry && (
            <div>
              <label className="text-sm font-medium text-gray-500">Industry</label>
              <p className="text-gray-900">{client.industry}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Brand Colors</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Primary Color</label>
            <div className="flex items-center space-x-3 mt-1">
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: client.branding.primaryColor }}
              />
              <span className="text-gray-900 font-mono">{client.branding.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Secondary Color</label>
            <div className="flex items-center space-x-3 mt-1">
              <div
                className="w-12 h-12 rounded border border-gray-300"
                style={{ backgroundColor: client.branding.secondaryColor }}
              />
              <span className="text-gray-900 font-mono">{client.branding.secondaryColor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="secondary" className="w-full">
              📤 Upload Assets
            </Button>
            <Button variant="secondary" className="w-full">
              📅 Schedule Post
            </Button>
            <Button variant="secondary" className="w-full">
              📊 View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
