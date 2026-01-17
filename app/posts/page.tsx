'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { postsApi, clientsApi } from '@/lib/api';
import { format } from 'date-fns';

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const [postsRes, clientsRes] = await Promise.all([
        postsApi.getAll(),
        clientsApi.getAll()
      ]);

      setPosts(postsRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedPlatform === 'all'
    ? posts
    : posts.filter(p => p.platform === selectedPlatform);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View all published posts and their performance
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + (p.analytics?.likes || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + (p.analytics?.comments || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Comments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + (p.analytics?.shares || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Shares</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {posts.reduce((sum, p) => sum + (p.analytics?.impressions || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Impressions</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter by platform:</span>
              <button
                onClick={() => setSelectedPlatform('all')}
                className={`px-3 py-1 rounded text-sm ${selectedPlatform === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All
              </button>
              {['facebook', 'instagram', 'linkedin', 'gmb', 'youtube'].map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-3 py-1 rounded text-sm capitalize ${selectedPlatform === platform ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">
                Posts will appear here once they are published
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const client = clients.find(c => c.id === post.clientId);

              return (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Media Preview */}
                      {post.mediaUrl && (
                        <div className="flex-shrink-0">
                          {post.mediaUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img
                              src={post.mediaUrl}
                              alt="Post media"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <video
                              src={post.mediaUrl}
                              className="w-32 h-32 object-cover rounded-lg"
                              controls={false}
                            />
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {client && (
                            <span className="text-sm font-medium text-gray-600">
                              {client.name}
                            </span>
                          )}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase">
                            {post.platform}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(post.publishedAt), 'MMM dd, yyyy • hh:mm a')}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-3">{post.caption}</p>

                        {/* Analytics */}
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <span>👍</span>
                            <span>{post.analytics?.likes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{post.analytics?.comments || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>🔄</span>
                            <span>{post.analytics?.shares || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>👁️</span>
                            <span>{post.analytics?.impressions || 0}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {post.postUrl && (
                          <div className="mt-3">
                            <a
                              href={post.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View on {post.platform} →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
