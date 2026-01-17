'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { assetsApi } from '@/lib/api';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'logo' | 'music';
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  tags: string[];
  createdAt: string;
}

export function AssetsTab({ clientId }: { clientId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [clientId]);

  const fetchAssets = async () => {
    try {
      const response = await assetsApi.getByClient(clientId);
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('type', file.type.startsWith('image/') ? 'image' : 'video');

        await assetsApi.upload(clientId, formData);
      }
      await fetchAssets();
    } catch (error) {
      console.error('Failed to upload assets:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [clientId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    }
  });

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await assetsApi.delete(assetId);
      await fetchAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading assets...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors
              ${isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="text-6xl mb-4">📁</div>
            {uploading ? (
              <p className="text-lg text-gray-600">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-lg text-blue-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-lg text-gray-900 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports: Images (PNG, JPG, GIF) and Videos (MP4, MOV, AVI)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      {assets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🖼️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-gray-500">
              Upload logos, images, and videos for this client
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 relative">
                {asset.type === 'image' || asset.type === 'logo' ? (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={asset.url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                )}
                {asset.isPrimary && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    ⭐ Primary
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate mb-2">
                  {asset.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 uppercase">{asset.type}</span>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
