// Mock API for demo mode using localStorage
// This allows the frontend to work without a backend

interface Client {
  id: string;
  name: string;
  industry: string;
  brandColor: string;
  logoUrl?: string;
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

export const mockClientsApi = {
  getAll: async () => {
    const clients = getStorageData<Client>('autoupload_clients');
    return { data: { data: clients } };
  },

  getById: async (id: string) => {
    const clients = getStorageData<Client>('autoupload_clients');
    const client = clients.find(c => c.id === id);
    return { data: { data: client } };
  },

  create: async (data: Omit<Client, 'id' | 'createdAt'>) => {
    const clients = getStorageData<Client>('autoupload_clients');
    const newClient: Client = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    clients.push(newClient);
    setStorageData('autoupload_clients', clients);
    return { data: { data: newClient } };
  },

  update: async (id: string, data: Partial<Client>) => {
    const clients = getStorageData<Client>('autoupload_clients');
    const index = clients.findIndex(c => c.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...data };
      setStorageData('autoupload_clients', clients);
      return { data: { data: clients[index] } };
    }
    throw new Error('Client not found');
  },

  delete: async (id: string) => {
    const clients = getStorageData<Client>('autoupload_clients');
    const filtered = clients.filter(c => c.id !== id);
    setStorageData('autoupload_clients', filtered);
    return { data: { success: true } };
  }
};

export const mockAssetsApi = {
  getByClient: async (clientId: string) => {
    const assets = getStorageData<Asset>('autoupload_assets');
    const clientAssets = assets.filter(a => a.clientId === clientId);
    return { data: { data: clientAssets } };
  },

  upload: async (clientId: string, formData: FormData) => {
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const metadataStr = formData.get('metadata') as string;

    const base64 = await fileToBase64(file);

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
    return { data: { data: newAsset } };
  },

  delete: async (id: string) => {
    const assets = getStorageData<Asset>('autoupload_assets');
    const filtered = assets.filter(a => a.id !== id);
    setStorageData('autoupload_assets', filtered);
    return { data: { success: true } };
  }
};

export const mockCalendarApi = {
  getByClient: async (clientId: string) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const clientEntries = entries.filter(e => e.clientId === clientId);
    return { data: { data: clientEntries } };
  },

  getAll: async () => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    return { data: { data: entries } };
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
    return { data: { data: newEntry } };
  },

  update: async (id: string, data: Partial<ContentCalendar>) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const index = entries.findIndex(e => e.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], ...data };
      setStorageData('autoupload_calendar', entries);
      return { data: { data: entries[index] } };
    }
    throw new Error('Entry not found');
  },

  delete: async (id: string) => {
    const entries = getStorageData<ContentCalendar>('autoupload_calendar');
    const filtered = entries.filter(e => e.id !== id);
    setStorageData('autoupload_calendar', filtered);
    return { data: { success: true } };
  }
};

export const mockPostsApi = {
  getByClient: async (clientId: string) => {
    return { data: { data: [] } };
  },

  getAll: async () => {
    return { data: { data: [] } };
  },

  getById: async (id: string) => {
    return { data: { data: null } };
  }
};

export const mockPlatformAccountsApi = {
  getByClient: async (clientId: string) => {
    const accounts = getStorageData('autoupload_platforms');
    return { data: { data: accounts.filter((a: any) => a.clientId === clientId) } };
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
    return { data: { data: newAccount } };
  },

  disconnect: async (id: string) => {
    const accounts = getStorageData('autoupload_platforms');
    const filtered = accounts.filter((a: any) => a.id !== id);
    setStorageData('autoupload_platforms', filtered);
    return { data: { success: true } };
  }
};

// Check if we're in demo mode
export const isDemoMode = () => {
  if (typeof window === 'undefined') return false;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return apiUrl.includes('localhost');
};
