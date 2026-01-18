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
  metadata?: {
    logoPlacement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    logoSize?: 'small' | 'medium' | 'large';
    logoOpacity?: number;
  };
  createdAt: string;
}

export function AssetsTab({ clientId }: { clientId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [logoPlacement, setLogoPlacement] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [logoOpacity, setLogoOpacity] = useState(90);
  const [activeTab, setActiveTab] = useState<'all' | 'logo' | 'image' | 'video'>('all');

  const fetchAssets = useCallback(async () => {
    try {
      const response = await assetsApi.getByClient(clientId);
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      alert('No valid files selected. Please upload images (PNG, JPG, GIF, WebP) or videos (MP4, MOV, AVI, WebM).');
      return;
    }

    setUploading(true);
    setUploadProgress(`Uploading 0 of ${acceptedFiles.length} files...`);

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${acceptedFiles.length}: ${file.name}`);

        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('name', file.name);

          // Determine file type based on MIME type
          let fileType = 'image';
          if (file.type.startsWith('video/')) {
            fileType = 'video';
          } else if (file.type.startsWith('image/')) {
            fileType = 'image';
          } else {
            // Fallback to extension check
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv'].includes(ext || '')) {
              fileType = 'video';
            }
          }

          formData.append('type', fileType);

          await assetsApi.upload(clientId, formData);
          successCount++;
          console.log(`✅ Uploaded: ${file.name} (${fileType})`);
        } catch (fileError) {
          failCount++;
          console.error(`❌ Failed to upload ${file.name}:`, fileError);
        }
      }

      await fetchAssets();

      // Show result
      if (failCount === 0) {
        setUploadProgress(`✅ Successfully uploaded ${successCount} file(s)!`);
      } else {
        setUploadProgress(`⚠️ Uploaded ${successCount}, failed ${failCount} file(s)`);
      }

      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Failed to upload assets:', error);
      alert('Failed to upload files. Please try again.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  }, [clientId, fetchAssets]);

  const onLogoUpload = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('type', 'logo');
        formData.append('metadata', JSON.stringify({
          logoPlacement,
          logoSize,
          logoOpacity: logoOpacity / 100
        }));

        await assetsApi.upload(clientId, formData);
      }
      await fetchAssets();
    } catch (error) {
      console.error('Failed to upload logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [clientId, logoPlacement, logoSize, logoOpacity, fetchAssets]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 50,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/webm': ['.webm'],
      'video/x-matroska': ['.mkv']
    },
    onDropRejected: (fileRejections) => {
      const messages = fileRejections.map(rejection =>
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      alert(`Some files were rejected:\n${messages.join('\n')}`);
    }
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onLogoUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1
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

  const logos = assets.filter(a => a.type === 'logo');
  const images = assets.filter(a => a.type === 'image');
  const videos = assets.filter(a => a.type === 'video');
  const filteredAssets = activeTab === 'all' ? assets :
                         activeTab === 'logo' ? logos :
                         activeTab === 'image' ? images : videos;

  return (
    <div className="space-y-6">
      {/* Logo Upload Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Brand Logo</h3>
          <p className="text-sm text-gray-600">Upload your logo to be embedded in all generated content</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Logo Upload */}
            <div className="lg:col-span-2">
              <div
                {...getLogoRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${isLogoDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input {...getLogoInputProps()} />
                <div className="text-5xl mb-3">🎨</div>
                {uploading ? (
                  <p className="text-gray-600">Uploading logo...</p>
                ) : isLogoDragActive ? (
                  <p className="text-blue-600">Drop your logo here...</p>
                ) : (
                  <>
                    <p className="text-gray-900 font-medium mb-1">
                      Upload Brand Logo
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, or SVG (transparent background recommended)
                    </p>
                  </>
                )}
              </div>

              {/* Current Logos */}
              {logos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {logos.map((logo) => (
                    <div key={logo.id} className="relative border rounded-lg p-3 bg-white">
                      <img src={logo.url} alt={logo.name} className="w-full h-20 object-contain mb-2" />
                      <p className="text-xs text-gray-600 truncate mb-1">{logo.name}</p>
                      {logo.isPrimary && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Primary</span>
                      )}
                      <button
                        onClick={() => deleteAsset(logo.id)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logo Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Placement
                </label>
                <select
                  value={logoPlacement}
                  onChange={(e) => setLogoPlacement(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Size
                </label>
                <select
                  value={logoSize}
                  onChange={(e) => setLogoSize(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="small">Small (10%)</option>
                  <option value="medium">Medium (15%)</option>
                  <option value="large">Large (20%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Opacity: {logoOpacity}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={logoOpacity}
                  onChange={(e) => setLogoOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
                💡 These settings will be applied to all content generated with your logo
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Assets Upload */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Media Assets</h3>
          <p className="text-sm text-gray-600">Upload images and videos for your content</p>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-10 text-center cursor-pointer
              transition-colors
              ${uploading ? 'border-green-500 bg-green-50 pointer-events-none' :
                isDragActive ? 'border-blue-500 bg-blue-50' :
                'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="text-5xl mb-3">{uploading ? '⏳' : '📁'}</div>
            {uploading ? (
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{uploadProgress}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Please wait, uploading files...</p>
              </div>
            ) : isDragActive ? (
              <div>
                <p className="text-blue-600 font-medium mb-1">Drop the files here...</p>
                <p className="text-sm text-gray-500">Upload multiple images and videos at once!</p>
              </div>
            ) : (
              <>
                <p className="text-gray-900 font-medium mb-1">
                  Drag & drop multiple files, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Images: PNG, JPG, GIF, WebP • Videos: MP4, MOV, AVI, WebM, MKV
                </p>
                <p className="text-xs text-blue-600">
                  ✨ You can upload up to 50 files at once!
                </p>
              </>
            )}
          </div>

          {uploadProgress && !uploading && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">{uploadProgress}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Filter Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('logo')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'logo'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Logos ({logos.length})
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'image'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'video'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Videos ({videos.length})
        </button>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-3">🖼️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'all' ? 'assets' : activeTab + 's'} yet
            </h3>
            <p className="text-gray-500">
              Upload {activeTab === 'all' ? 'logos, images, and videos' : activeTab + 's'} for this client
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                  />
                )}
                {asset.isPrimary && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    ⭐ Primary
                  </div>
                )}
                {asset.type === 'logo' && asset.metadata && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {asset.metadata.logoPlacement?.replace('-', ' ')}
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
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
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
