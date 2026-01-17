// Mock API for demo mode using localStorage
// This allows the frontend to work without a backend

import { AxiosResponse } from 'axios';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
  };
  industry?: string;
  website?: string;
  active: boolean;
  createdAt: string;
}

interface Asset {
  id: string;
  clientId: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'music';
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  tags: string[];
  metadata?: {
    logoPlacement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    logoSize?: 'small' | 'medium' | 'large';
    logoOpacity?: number;
  };
  createdAt: string;
}

interface ContentCalendar {
  id: string;
  clientId: string;
  scheduledDate: string;
  caption: string;
  contentType: string;
  platforms: any;
  visualInstructions: any;
  status: string;
  createdAt: string;
}

// Helper to get data from localStorage
const getStorageData = <T>(key: string, defaultValue: T[] = []): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Helper to set data in localStorage
const setStorageData = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

// Create mock Axios response
const createMockResponse = <T>(data: T): AxiosResponse<T> => {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  } as AxiosResponse<T>;
};

export const mockClientsApi = {
  getAll: async () => {
    console.log('[DEMO MODE] Fetching all clients from localStorage');
    const clients = getStorageData<Client>('autoupload_clients');
    console.log('[DEMO MODE] Found clients:', clients.length);
    return createMockResponse({ data: clients });
  },

  getById: async (id: string) => {
    console.log('[DEMO MODE] Fetching client:', id);
    const clients = getStorageData<Client>('autoupload_clients');
    const client = clients.find(c => c.id === id);
    console.log('[DEMO MODE] Client found:', !!client);
    return createMockResponse({ data: client });
  },

  create: async (data: Omit<Client, 'id' | 'createdAt' | 'active'>) => {
    console.log('[DEMO MODE] Creating client:', data);
    const clients = getStorageData<Client>('autoupload_clients');
    const newClient: Client = {
      ...data,
      id: generateId(),
      active: true,
      createdAt: new Date().toISOString()
    };
    clients.push(newClient);
    setStorageData('autoupload_clients', clients);
    console.log('[DEMO MODE] Client created:', newClient);
    return createMockResponse({ data: newClient });
  },

  update: async (id: string, data: Partial<Client>) => {
    console.log('[DEMO MODE] Updating client:', id, data);
    const clients = getStorageData<Client>('autoupload_clients');
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      setStorageData('autoupload_clients', clients);
      console.log('[DEMO MODE] Client updated:', clients[index]);
      return createMockResponse({ data: clients[index] });
    }
    throw new Error('Client not found');
  },

  delete: async (id: string) => {
    console.log('[DEMO MODE] Deleting client:', id);
    const clients = getStorageData<Client>('autoupload_clients');
    const filtered = clients.filter(c => c.id !== id);
    setStorageData('autoupload_clients', filtered);
    console.log('[DEMO MODE] Client deleted');
    return createMockResponse({ success: true });
  }
};

export const mockAssetsApi = {
  getByClient: async (clientId: string) => {
    console.log('[DEMO MODE] Fetching assets for client:', clientId);
    const assets = getStorageData<Asset>('autoupload_assets');
    const clientAssets = assets.filter(a => a.clientId === clientId);
    console.log('[DEMO MODE] Found assets:', clientAssets.length);
    return createMockResponse({ data: clientAssets });
  },

  upload: async (clientId: string, formData: FormData) => {
    console.log('[DEMO MODE] Uploading asset for client:', clientId);
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const metadataStr = formData.get('metadata') as string;

    console.log('[DEMO MODE] File details:', { name, type, size: file?.size });

    if (!file) {
      console.error('[DEMO MODE] No file provided');
      throw new Error('No file provided');
    }

    const base64 = await fileToBase64(file);
    console.log('[DEMO MODE] File converted to base64, length:', base64.length);

    const assets = getStorageData<Asset>('autoupload_assets');
    const newAsset: Asset = {
      id: generateId(),
      clientId,
      name,
      type: type as any,
      url: base64,
      isPrimary: assets.filter(a => a.clientId === clientId && a.type === type).length === 0,
      tags: [],
      metadata: metadataStr ? JSON.parse(metadataStr) : undefined,
      createdAt: new Date().toISOString()
    };

    assets.push(newAsset);
    setStorageData('autoupload_assets', assets);
    console.log('[DEMO MODE] Asset uploaded successfully:', newAsset.id);
    return createMockResponse({ data: newAsset });
  },

  delete: async (id: string) => {
    console.log('[DEMO MODE] Deleting asset:', id);
    const assets = getStorageData<Asset>('autoupload_assets');
    const filtered = assets.filter(a => a.id !== id);
    setStorageData('autoupload_assets', filtered);
    console.log('[DEMO MODE] Asset deleted');
    return createMockResponse({ success: true });
  }
};

export const mockCalendarApi = {
  getByClient: async (clientId: string) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const clientEntries = entries.filter(e => e.clientId === clientId);
    return createMockResponse({ data: clientEntries });
  },

  getAll: async () => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    return createMockResponse({ data: entries });
  },

  create: async (data: Omit<ContentCalendar, 'id' | 'createdAt'>) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const newEntry: ContentCalendar = {
      ...data,
      id: generateId(),
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    entries.push(newEntry);
    setStorageData('autoupload_calendar', entries);
    return createMockResponse({ data: newEntry });
  },

  update: async (id: string, data: Partial<ContentCalendar>) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data };
      setStorageData('autoupload_calendar', entries);
      return createMockResponse({ data: entries[index] });
    }
    throw new Error('Entry not found');
  },

  delete: async (id: string) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const filtered = entries.filter(e => e.id !== id);
    setStorageData('autoupload_calendar', filtered);
    return createMockResponse({ success: true });
  }
};

export const mockPostsApi = {
  getByClient: async (clientId: string) => {
    return createMockResponse({ data: [] });
  },

  getAll: async () => {
    return createMockResponse({ data: [] });
  },

  getById: async (id: string) => {
    return createMockResponse({ data: null });
  }
};

export const mockPlatformAccountsApi = {
  getByClient: async (clientId: string) => {
    const accounts = getStorageData('autoupload_platforms');
    return createMockResponse({ data: accounts.filter((a: any) => a.clientId === clientId) });
  },

  connect: async (clientId: string, platform: string) => {
    const accounts = getStorageData('autoupload_platforms');
    const newAccount = {
      id: generateId(),
      clientId,
      platform,
      status: 'demo',
      createdAt: new Date().toISOString()
    };
    accounts.push(newAccount);
    setStorageData('autoupload_platforms', accounts);
    return createMockResponse({ data: newAccount });
  },

  disconnect: async (id: string) => {
    const accounts = getStorageData('autoupload_platforms');
    const filtered = accounts.filter((a: any) => a.id !== id);
    setStorageData('autoupload_platforms', filtered);
    return createMockResponse({ success: true });
  }
};

// Check if we're in demo mode
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return apiUrl.includes('localhost');
};
