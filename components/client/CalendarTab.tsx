'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { clientsApi, assetsApi } from '@/lib/api';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';

interface GeneratedPost {
  id: string;
  date: string;
  time: string;
  contentType: 'educational' | 'promotional' | 'engaging' | 'inspirational';
  postFormat: 'image' | 'video' | 'carousel' | 'text' | 'quote' | 'tip' | 'announcement';
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
  const [currentWeek, setCurrentWeek] = useState(0);

  const fetchClientAndGeneratePosts = useCallback(async () => {
    try {
      const clientResponse = await clientsApi.getById(clientId);
      const clientData = clientResponse.data.data;
      setClient(clientData);

      const assetsResponse = await assetsApi.getByClient(clientId);
      const assets = assetsResponse.data.data || [];

      if (!clientData.businessProfile || !clientData.contentStrategy) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const profile = clientData.businessProfile;
      const strategy = clientData.contentStrategy;
      const postsPerDay = strategy.postingFrequency || 1;
      const totalDays = 30;
      const generatedPosts: GeneratedPost[] = [];

      // Extract clean business name (first sentence or first 50 chars)
      const businessName = clientData.name || 'Our Business';
      const businessDesc = profile.businessDescription || '';
      const businessFocus = businessDesc.split('.')[0] || businessDesc.substring(0, 50);

      // Content type distribution
      const contentTypes: Array<'educational' | 'promotional' | 'engaging' | 'inspirational'> = [];
      const mix = strategy.contentMix;

      for (let i = 0; i < mix.educational; i++) contentTypes.push('educational');
      for (let i = 0; i < mix.promotional; i++) contentTypes.push('promotional');
      for (let i = 0; i < mix.engaging; i++) contentTypes.push('engaging');
      for (let i = 0; i < mix.inspirational; i++) contentTypes.push('inspirational');

      // Post format variety
      const postFormats: Array<'image' | 'video' | 'carousel' | 'text' | 'quote' | 'tip' | 'announcement'> = [
        'image', 'image', 'video', 'carousel', 'text', 'quote', 'tip', 'announcement'
      ];

      const images = assets.filter((a: any) => a.type === 'image');
      const videos = assets.filter((a: any) => a.type === 'video');

      let contentTypeIndex = 0;
      let postFormatIndex = 0;

      for (let day = 0; day < totalDays; day++) {
        for (let postNum = 0; postNum < postsPerDay; postNum++) {
          const postDate = addDays(new Date(), day);
          const contentType = contentTypes[contentTypeIndex % contentTypes.length];
          const postFormat = postFormats[postFormatIndex % postFormats.length];

          contentTypeIndex++;
          postFormatIndex++;

          const themeIndex = (day * postsPerDay + postNum) % strategy.contentThemes.length;
          const theme = strategy.contentThemes[themeIndex] || 'Update';

          // Generate professional short caption
          const caption = generateProfessionalCaption(
            contentType,
            postFormat,
            theme,
            businessName,
            day * postsPerDay + postNum
          );

          // Select visual based on format
          let imageUrl, videoUrl;
          if (postFormat === 'video' && videos.length > 0) {
            const videoIndex = (day * postsPerDay + postNum) % videos.length;
            videoUrl = videos[videoIndex].url;
          } else if (['image', 'carousel'].includes(postFormat) && images.length > 0) {
            const imageIndex = (day * postsPerDay + postNum) % images.length;
            imageUrl = images[imageIndex].url;
          }

          const hashtags = generateSmartHashtags(
            strategy.hashtagStrategy,
            theme,
            day * postsPerDay + postNum
          );

          generatedPosts.push({
            id: `post-${day}-${postNum}`,
            date: format(postDate, 'yyyy-MM-dd'),
            time: getOptimalPostTime(postNum),
            contentType,
            postFormat,
            caption,
            imageUrl,
            videoUrl,
            platforms: ['Facebook', 'Instagram', 'LinkedIn'],
            hashtags,
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
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Intelligence Required</h3>
          <p className="text-gray-600 mb-4">
            Complete the Business Intelligence tab to generate your content calendar
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group posts by week
  const weekStart = addWeeks(startOfWeek(new Date()), currentWeek);
  const weekPosts = posts.filter(post => {
    const postDate = new Date(post.date);
    const weekEnd = addDays(weekStart, 7);
    return postDate >= weekStart && postDate < weekEnd;
  });

  const groupedByDay: { [key: string]: GeneratedPost[] } = {};
  weekPosts.forEach(post => {
    if (!groupedByDay[post.date]) {
      groupedByDay[post.date] = [];
    }
    groupedByDay[post.date].push(post);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <p className="text-sm text-gray-600 mt-1">
            {posts.length} posts scheduled over 30 days • {client.contentStrategy.postingFrequency} post{client.contentStrategy.postingFrequency > 1 ? 's' : ''} per day
          </p>
        </div>
        <button
          onClick={regenerateAll}
          disabled={generating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {generating ? '🔄 Regenerating...' : '🔄 Regenerate Calendar'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
            <div className="text-xs text-gray-600">Total Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.postFormat === 'video').length}
            </div>
            <div className="text-xs text-gray-600">Video Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {posts.filter(p => p.postFormat === 'image').length}
            </div>
            <div className="text-xs text-gray-600">Image Posts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-xs text-gray-600">Platforms</div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <button
          onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
          disabled={currentWeek === 0}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous Week
        </button>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            Week {currentWeek + 1} of 5
          </div>
          <div className="text-sm text-gray-600">
            {format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
          </div>
        </div>
        <button
          onClick={() => setCurrentWeek(Math.min(4, currentWeek + 1))}
          disabled={currentWeek >= 4}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Week →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: 7 }).map((_, dayIndex) => {
          const currentDay = addDays(weekStart, dayIndex);
          const dayKey = format(currentDay, 'yyyy-MM-dd');
          const dayPosts = groupedByDay[dayKey] || [];

          return (
            <Card key={dayIndex} className="min-h-[200px]">
              <CardHeader className="pb-2">
                <div className="text-sm font-semibold text-gray-900">
                  {format(currentDay, 'd')}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-2 rounded text-xs border-l-4 ${getFormatColor(post.postFormat)}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span>{getFormatIcon(post.postFormat)}</span>
                      <span className="font-medium">{post.time}</span>
                    </div>
                    <p className="text-gray-700 line-clamp-2 text-xs">
                      {post.caption}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {post.platforms.slice(0, 3).map((p) => (
                        <span key={p} className="text-xs">
                          {getPlatformIcon(p)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {dayPosts.length === 0 && (
                  <div className="text-center text-gray-400 text-xs py-4">No posts</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Post Details Section */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Week {currentWeek + 1} Posts Preview</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekPosts.map((post) => (
              <div key={post.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFormatIcon(post.postFormat)}</span>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {format(new Date(post.date), 'EEEE, MMM dd')} at {post.time}
                      </div>
                      <div className="text-xs text-gray-500">
                        {post.contentType} • {post.postFormat}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${getTypeColor(post.contentType)}`}>
                    {post.contentType}
                  </span>
                </div>

                {(post.imageUrl || post.videoUrl) && (
                  <div className="my-3">
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full max-w-md h-64 object-cover rounded-lg"
                      />
                    )}
                    {post.videoUrl && (
                      <video
                        src={post.videoUrl}
                        className="w-full max-w-md h-64 object-cover rounded-lg"
                        controls
                      />
                    )}
                  </div>
                )}

                <p className="text-gray-800 mb-2">{post.caption}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-sm text-blue-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  {post.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {getPlatformIcon(platform)} {platform}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PROFESSIONAL SHORT CAPTION GENERATOR
function generateProfessionalCaption(
  contentType: string,
  postFormat: string,
  theme: string,
  businessName: string,
  index: number
): string {
  const templates: Record<string, string[]> = {
    educational: [
      `Quick tip: ${theme} can transform your approach. Here's what you need to know.`,
      `Did you know? ${theme} is a game-changer. Let's explore why.`,
      `Today's focus: ${theme}. Master this and see real results.`,
      `The secret to ${theme}? It's simpler than you think.`,
      `Why ${theme} matters: A quick breakdown for you.`,
      `${theme} 101: Everything you need to get started.`,
      `Understanding ${theme} made easy. Check this out.`
    ],
    promotional: [
      `Ready to elevate your ${theme}? We've got you covered.`,
      `Transform your ${theme} today. Results you can see.`,
      `${businessName} makes ${theme} effortless. Discover how.`,
      `Your ${theme} solution is here. Let's get started.`,
      `Unlock better ${theme} with ${businessName}. See the difference.`,
      `${theme} excellence starts here. Join us today.`,
      `Experience ${theme} done right. Your success is our mission.`
    ],
    engaging: [
      `Quick question: What's your take on ${theme}? Drop a comment!`,
      `Let's discuss ${theme}. What's working for you?`,
      `Your opinion matters: How do you approach ${theme}?`,
      `${theme} - love it or find it challenging? Let us know!`,
      `What's your ${theme} strategy? Share below!`,
      `Real talk: How does ${theme} fit into your workflow?`,
      `We want to hear from you about ${theme}. Comment below!`
    ],
    inspirational: [
      `Your potential with ${theme} is limitless. Keep pushing forward.`,
      `${theme} success is within reach. Believe in your journey.`,
      `Transform your ${theme} game. You've got this!`,
      `The future of ${theme} starts with you. Make it happen.`,
      `Dream bigger with ${theme}. Your success story begins now.`,
      `${theme} mastery awaits. Take the first step today.`,
      `Your ${theme} breakthrough is closer than you think.`
    ]
  };

  const typeTemplates = templates[contentType] || templates.educational;
  return typeTemplates[index % typeTemplates.length];
}

function generateSmartHashtags(
  strategyHashtags: string[],
  theme: string,
  index: number
): string[] {
  if (strategyHashtags.length === 0) {
    return [`#${theme.replace(/\s+/g, '')}`];
  }

  const hashtagCount = 4 + (index % 4); // 4-7 hashtags
  const rotationOffset = index % strategyHashtags.length;
  const rotatedHashtags = [
    ...strategyHashtags.slice(rotationOffset),
    ...strategyHashtags.slice(0, rotationOffset)
  ];

  return rotatedHashtags.slice(0, hashtagCount);
}

function getOptimalPostTime(postNum: number): string {
  const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'];
  return times[postNum % times.length];
}

function getFormatIcon(format: string): string {
  const icons: Record<string, string> = {
    'image': '📷',
    'video': '🎥',
    'carousel': '🎠',
    'text': '📝',
    'quote': '💬',
    'tip': '💡',
    'announcement': '📢'
  };
  return icons[format] || '📄';
}

function getFormatColor(format: string): string {
  const colors: Record<string, string> = {
    'image': 'border-blue-500 bg-blue-50',
    'video': 'border-red-500 bg-red-50',
    'carousel': 'border-purple-500 bg-purple-50',
    'text': 'border-gray-500 bg-gray-50',
    'quote': 'border-green-500 bg-green-50',
    'tip': 'border-yellow-500 bg-yellow-50',
    'announcement': 'border-orange-500 bg-orange-50'
  };
  return colors[format] || 'border-gray-500 bg-gray-50';
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
