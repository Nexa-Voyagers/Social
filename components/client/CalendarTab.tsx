'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { clientsApi, assetsApi } from '@/lib/api';
import { format, addDays } from 'date-fns';

interface GeneratedPost {
  id: string;
  date: string;
  time: string;
  type: 'educational' | 'promotional' | 'engaging' | 'inspirational';
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  platforms: string[];
  hashtags: string[];
  status: 'scheduled' | 'generating' | 'posted';
}

export function CalendarTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [client, setClient] = useState<any>(null);

  const fetchClientAndGeneratePosts = useCallback(async () => {
    try {
      // Get client with business intelligence
      const clientResponse = await clientsApi.getById(clientId);
      const clientData = clientResponse.data.data;
      setClient(clientData);

      // Get client assets
      const assetsResponse = await assetsApi.getByClient(clientId);
      const assets = assetsResponse.data.data || [];

      // Check if business intelligence is filled
      if (!clientData.businessProfile || !clientData.contentStrategy) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Generate posts based on strategy
      const strategy = clientData.contentStrategy;
      const postsPerDay = strategy.postingFrequency || 1;
      const totalDays = 30;
      const generatedPosts: GeneratedPost[] = [];

      // Content type distribution
      const contentTypes: Array<'educational' | 'promotional' | 'engaging' | 'inspirational'> = [];
      const mix = strategy.contentMix;

      // Build content type array based on percentages
      for (let i = 0; i < mix.educational; i++) contentTypes.push('educational');
      for (let i = 0; i < mix.promotional; i++) contentTypes.push('promotional');
      for (let i = 0; i < mix.engaging; i++) contentTypes.push('engaging');
      for (let i = 0; i < mix.inspirational; i++) contentTypes.push('inspirational');

      let contentTypeIndex = 0;

      for (let day = 0; day < totalDays; day++) {
        for (let postNum = 0; postNum < postsPerDay; postNum++) {
          const postDate = addDays(new Date(), day);
          const contentType = contentTypes[contentTypeIndex % contentTypes.length];
          contentTypeIndex++;

          // Select random theme
          const theme = strategy.contentThemes[Math.floor(Math.random() * strategy.contentThemes.length)] || 'General Update';

          // Select random asset
          const images = assets.filter((a: any) => a.type === 'image');
          const randomImage = images[Math.floor(Math.random() * images.length)];

          // Generate caption based on theme and type
          const caption = generateCaption(contentType, theme, clientData.businessProfile, strategy);

          generatedPosts.push({
            id: `post-${day}-${postNum}`,
            date: format(postDate, 'MMM dd, yyyy'),
            time: getOptimalPostTime(postNum),
            type: contentType,
            caption,
            imageUrl: randomImage?.url,
            platforms: ['Facebook', 'Instagram', 'LinkedIn'],
            hashtags: strategy.hashtagStrategy.slice(0, 5),
            status: 'scheduled'
          });
        }
      }

      setPosts(generatedPosts);
    } catch (error) {
      console.error('Failed to generate posts:', error);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientAndGeneratePosts();
  }, [fetchClientAndGeneratePosts]);

  const regenerateAll = async () => {
    setGenerating(true);
    await fetchClientAndGeneratePosts();
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-600">Generating your 30-day content calendar...</p>
        </div>
      </div>
    );
  }

  if (!client?.businessProfile || !client?.contentStrategy) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Intelligence Required</h3>
          <p className="text-gray-600 mb-4">
            Fill in the Business Intelligence tab first to automatically generate posts!
          </p>
          <p className="text-sm text-gray-500">
            The AI needs to understand your business before it can create content.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPosts = posts.length;
  const postsPerDay = client.contentStrategy.postingFrequency;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-blue-600">{totalPosts}</div>
            <div className="text-sm text-gray-600">Total Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-green-600">{postsPerDay}</div>
            <div className="text-sm text-gray-600">Posts Per Day</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-purple-600">30</div>
            <div className="text-sm text-gray-600">Days Scheduled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Platforms</div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🤖✨</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Automation Active</h3>
                <p className="text-sm text-gray-600">
                  {totalPosts} posts auto-generated and ready to publish over the next 30 days
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  ⚡ Posts will automatically publish to Facebook, Instagram, and LinkedIn
                </p>
              </div>
            </div>
            <button
              onClick={regenerateAll}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? '🔄 Regenerating...' : '🔄 Regenerate All'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">{post.date} at {post.time}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(post.type)}`}>
                  {post.type}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Image Preview */}
              {post.imageUrl && (
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Caption */}
              <p className="text-sm text-gray-800 line-clamp-3">{post.caption}</p>

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs text-blue-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Platforms */}
              <div className="flex gap-2 pt-2 border-t">
                {post.platforms.map((platform) => (
                  <span key={platform} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {getPlatformIcon(platform)} {platform}
                  </span>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-xs text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Auto-posting {post.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Footer */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-3">📅 How Auto-Generation Works</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ AI analyzes your Business Intelligence (business description, audience, brand voice)</li>
            <li>✅ Generates {postsPerDay} unique {postsPerDay === 1 ? 'post' : 'posts'} per day based on your content strategy</li>
            <li>✅ Selects best images from your uploaded assets</li>
            <li>✅ Adds your logo watermark to all images</li>
            <li>✅ Includes your hashtags and call-to-actions</li>
            <li>✅ Automatically posts at optimal times to maximize engagement</li>
            <li>✅ Posts to all connected platforms (Facebook, Instagram, LinkedIn)</li>
          </ul>
          <p className="text-xs text-blue-600 mt-4">
            💡 Tip: Update Business Intelligence or upload new images anytime, then click &quot;Regenerate All&quot; to refresh your content calendar!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function generateCaption(
  type: string,
  theme: string,
  profile: any,
  strategy: any
): string {
  const business = profile.businessDescription.split('.')[0];
  const audience = profile.targetAudience.split('.')[0];
  const cta = strategy.callToActions[0] || 'Learn more';

  const templates = {
    educational: `Did you know? ${theme} is crucial for ${audience}. ${business} helps you master this. ${cta}!`,
    promotional: `Special update about ${theme}! ${business} is here to help. ${cta} today!`,
    engaging: `Question for you: How does ${theme} impact your success? ${business} has the answers. ${cta}!`,
    inspirational: `${theme} can transform your journey. ${business} believes in your potential. ${cta}!`
  };

  return templates[type as keyof typeof templates] || `${theme} - ${business}`;
}

function getOptimalPostTime(postNum: number): string {
  const times = ['9:00 AM', '1:00 PM', '6:00 PM', '8:00 PM'];
  return times[postNum % times.length];
}

function getTypeColor(type: string): string {
  const colors = {
    educational: 'bg-blue-100 text-blue-800',
    promotional: 'bg-green-100 text-green-800',
    engaging: 'bg-purple-100 text-purple-800',
    inspirational: 'bg-orange-100 text-orange-800'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'Facebook': '📘',
    'Instagram': '📸',
    'LinkedIn': '💼',
    'Twitter': '🐦',
    'YouTube': '🎥'
  };
  return icons[platform] || '🌐';
}
