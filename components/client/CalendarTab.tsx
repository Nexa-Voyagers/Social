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

      // Filter available images and videos
      const images = assets.filter((a: any) => a.type === 'image');
      const videos = assets.filter((a: any) => a.type === 'video');
      const allVisuals = [...images, ...videos];

      for (let day = 0; day < totalDays; day++) {
        for (let postNum = 0; postNum < postsPerDay; postNum++) {
          const postDate = addDays(new Date(), day);
          const contentType = contentTypes[contentTypeIndex % contentTypes.length];
          contentTypeIndex++;

          // Select theme sequentially with variation
          const themeIndex = (day * postsPerDay + postNum) % strategy.contentThemes.length;
          const theme = strategy.contentThemes[themeIndex] || 'General Update';

          // Cycle through visuals sequentially for variety (not random)
          const visualIndex = (day * postsPerDay + postNum) % Math.max(allVisuals.length, 1);
          const selectedVisual = allVisuals[visualIndex];

          // Generate unique caption with variation
          const caption = generateIntelligentCaption(
            contentType,
            theme,
            clientData.businessProfile,
            strategy,
            day * postsPerDay + postNum // Pass index for variation
          );

          // Generate varied hashtags (rotate and randomize count)
          const hashtags = generateVariedHashtags(
            strategy.hashtagStrategy,
            theme,
            day * postsPerDay + postNum
          );

          generatedPosts.push({
            id: `post-${day}-${postNum}`,
            date: format(postDate, 'MMM dd, yyyy'),
            time: getOptimalPostTime(postNum),
            type: contentType,
            caption,
            imageUrl: selectedVisual?.type === 'image' ? selectedVisual.url : undefined,
            videoUrl: selectedVisual?.type === 'video' ? selectedVisual.url : undefined,
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
function generateIntelligentCaption(
  type: string,
  theme: string,
  profile: any,
  strategy: any,
  postIndex: number
): string {
  // Extract business intelligence
  const businessDesc = profile.businessDescription || '';
  const audience = profile.targetAudience || '';
  const brandVoice = profile.brandVoice || 'professional';
  const keyMessages = profile.keyMessages || [];
  const brandValues = profile.brandValues || [];

  // Rotate through CTAs for variety
  const ctas = strategy.callToActions.length > 0
    ? strategy.callToActions
    : ['Learn more', 'Get started', 'Discover more', 'Join us', 'Find out how'];
  const cta = ctas[postIndex % ctas.length];

  // Get a key message if available
  const keyMessage = keyMessages.length > 0
    ? keyMessages[postIndex % keyMessages.length]
    : '';

  // Get a brand value if available
  const brandValue = brandValues.length > 0
    ? brandValues[postIndex % brandValues.length]
    : '';

  // Multiple template variations for each content type
  const templates: Record<string, string[]> = {
    educational: [
      `💡 ${theme} Insight:\n\n${keyMessage || `Understanding ${theme} is essential for ${audience}.`}\n\n${businessDesc.split('.')[0]}.\n\n${cta}!`,
      `📚 Let's talk about ${theme}.\n\nFor ${audience}, this matters because it directly impacts your success. ${keyMessage || `We've helped countless clients master this.`}\n\n${cta} 👉`,
      `🎓 Did you know?\n\n${theme} is one of the most overlooked aspects by ${audience}. ${keyMessage || `But it doesn't have to be complicated.`}\n\n${businessDesc.split('.')[0]}. ${cta}!`,
      `🔍 Deep dive into ${theme}:\n\n${keyMessage || `Here's what ${audience} need to know...`}\n\nWe believe ${brandValue || 'in empowering our clients with knowledge'}.\n\n${cta}!`,
      `✨ Expert tip about ${theme}:\n\n${keyMessage || `Most ${audience} miss this crucial detail.`} Let us show you the difference.\n\n${cta}!`,
      `📖 ${theme} explained simply:\n\nWe understand that ${audience} are busy. That's why we make it easy. ${keyMessage || businessDesc.split('.')[0]}.\n\n${cta}!`,
      `🧠 Smart thinking about ${theme}:\n\n${keyMessage || `The best ${audience} know this secret.`} Ready to level up?\n\n${cta}!`
    ],
    promotional: [
      `🎉 Exciting news about ${theme}!\n\n${businessDesc.split('.')[0]}. Perfect for ${audience}.\n\n${cta} today! 🚀`,
      `🌟 Special focus on ${theme}:\n\nWe're proud to offer solutions that ${audience} love. ${keyMessage || 'Quality and results are our priority.'}\n\n${cta}!`,
      `⭐ Why choose us for ${theme}?\n\nSimple: ${brandValue || 'We deliver results'}. ${businessDesc.split('.')[0]}.\n\nReady to see the difference? ${cta}!`,
      `🔥 ${theme} made simple!\n\nDesigned specifically for ${audience}, our approach is different. ${keyMessage || 'We focus on what matters most to you.'}\n\n${cta}!`,
      `💼 Professional ${theme} solutions:\n\n${businessDesc.split('.')[0]}. Trusted by ${audience} worldwide.\n\n${cta} 👉`,
      `✅ Looking for ${theme} expertise?\n\nYou're in the right place! ${keyMessage || `We specialize in helping ${audience} succeed.`}\n\n${cta}!`,
      `🎯 ${theme} tailored for ${audience}:\n\n${brandValue || 'Excellence'} is our standard. ${businessDesc.split('.')[0]}.\n\n${cta} today!`
    ],
    engaging: [
      `🤔 Quick question for ${audience}:\n\nHow does ${theme} fit into your strategy? ${keyMessage || 'We'd love to hear your thoughts!'}\n\nDrop a comment below! 👇`,
      `💬 Let's discuss ${theme}!\n\nWhat's your biggest challenge with this? ${businessDesc.split('.')[0]} and we're here to help.\n\nShare your experience! 💭`,
      `👋 ${audience}, we need your input!\n\n${theme} - love it or find it challenging? ${keyMessage || 'Your feedback helps us serve you better.'}\n\nComment below! ⬇️`,
      `🗣️ Real talk about ${theme}:\n\nWhat would make this easier for you? ${brandValue || 'We listen'} because ${audience} deserve the best.\n\nTell us what you think! 💬`,
      `❓ Pop quiz for ${audience}:\n\nWhen it comes to ${theme}, what's your go-to approach? ${keyMessage || 'We love learning from you!'}\n\nShare in comments! 👇`,
      `🎤 Your turn to share!\n\n${theme} - what's working for you? ${businessDesc.split('.')[0]} and your success stories inspire us.\n\nComment below! ⬇️`,
      `💭 Honest question:\n\nHow important is ${theme} in your daily work? ${audience} often tell us it's game-changing.\n\nWhat's your take? Drop a comment! 👇`
    ],
    inspirational: [
      `🌟 Your potential with ${theme} is unlimited.\n\n${brandValue || 'We believe in you'}. ${audience} like you are achieving amazing things every day.\n\n${businessDesc.split('.')[0]}. ${cta}!`,
      `✨ Transform your approach to ${theme}:\n\n${keyMessage || 'Success isn't just possible—it's within reach.'} ${audience} are already making it happen.\n\nReady to join them? ${cta}!`,
      `🚀 The future of ${theme} is bright.\n\nAnd ${audience} are leading the way! ${brandValue || 'Innovation and excellence'} drive everything we do.\n\n${businessDesc.split('.')[0]}. ${cta}!`,
      `💪 You've got this!\n\n${theme} might seem daunting, but ${audience} like you prove every day that it's achievable. ${keyMessage || 'Small steps lead to big results.'}\n\n${cta}!`,
      `🎯 Dream bigger with ${theme}:\n\n${brandValue || 'Excellence'} isn't an accident—it's a choice. ${businessDesc.split('.')[0]}.\n\nStart your journey today. ${cta}!`,
      `🌈 Success story alert!\n\n${audience} are mastering ${theme} and achieving incredible results. ${keyMessage || 'You could be next!'}\n\n${cta}!`,
      `⭐ Believe in possibilities:\n\n${theme} is your pathway to growth. ${brandValue || 'We're committed'} to helping ${audience} thrive.\n\n${businessDesc.split('.')[0]}. ${cta}!`
    ]
  };

  // Get template variations for this type
  const typeTemplates = templates[type as keyof typeof templates] || templates.educational;

  // Rotate through templates for variety
  const template = typeTemplates[postIndex % typeTemplates.length];

  return template;
}

function generateVariedHashtags(
  strategyHashtags: string[],
  theme: string,
  postIndex: number
): string[] {
  if (strategyHashtags.length === 0) {
    return [`#${theme.replace(/\s+/g, '')}`];
  }

  // Vary hashtag count between 3-7 per post
  const hashtagCount = 3 + (postIndex % 5);

  // Create a rotated copy of hashtags for variety
  const rotationOffset = postIndex % strategyHashtags.length;
  const rotatedHashtags = [
    ...strategyHashtags.slice(rotationOffset),
    ...strategyHashtags.slice(0, rotationOffset)
  ];

  // Add theme-based hashtag occasionally
  const includeThemeTag = postIndex % 3 === 0;
  const themeTag = `#${theme.replace(/\s+/g, '')}`;

  let selectedHashtags = rotatedHashtags.slice(0, hashtagCount);

  if (includeThemeTag && !selectedHashtags.includes(themeTag)) {
    // Replace last hashtag with theme tag
    selectedHashtags[selectedHashtags.length - 1] = themeTag;
  }

  return selectedHashtags;
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
