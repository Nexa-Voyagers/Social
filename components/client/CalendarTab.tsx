'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { calendarApi } from '@/lib/api';
import { format } from 'date-fns';

interface ContentItem {
  id: string;
  title: string;
  caption: string;
  contentType: 'image_post' | 'video_post' | 'reel' | 'story';
  scheduledAt: string;
  status: 'scheduled' | 'generating' | 'ready' | 'posting' | 'posted' | 'failed';
  hashtags: string[];
  platforms: {
    facebook?: { enabled: boolean };
    instagram?: { enabled: boolean };
    linkedin?: { enabled: boolean };
    gmb?: { enabled: boolean };
    youtube?: { enabled: boolean };
  };
}

export function CalendarTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [clientId]);

  const fetchContent = async () => {
    try {
      const response = await calendarApi.getByClient(clientId);
      setContent(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Content Calendar</h2>
          <p className="text-sm text-gray-500">
            Schedule posts for {clientName}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          + Schedule Post
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <AddContentForm
          clientId={clientId}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchContent();
          }}
        />
      )}

      {/* Calendar Items */}
      {content.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
            <p className="text-gray-500 mb-4">
              Create your first scheduled post
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Schedule Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {content.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <StatusBadge status={item.status} />
                      <TypeBadge type={item.contentType} />
                    </div>
                    <p className="text-gray-700 mb-3">{item.caption}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        {format(new Date(item.scheduledAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">🕐</span>
                        {format(new Date(item.scheduledAt), 'hh:mm a')}
                      </div>
                      {item.hashtags.length > 0 && (
                        <div className="flex items-center">
                          <span className="mr-2">#</span>
                          {item.hashtags.length} hashtags
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      {item.platforms.facebook?.enabled && <PlatformIcon platform="facebook" />}
                      {item.platforms.instagram?.enabled && <PlatformIcon platform="instagram" />}
                      {item.platforms.linkedin?.enabled && <PlatformIcon platform="linkedin" />}
                      {item.platforms.gmb?.enabled && <PlatformIcon platform="gmb" />}
                      {item.platforms.youtube?.enabled && <PlatformIcon platform="youtube" />}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    generating: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    posting: 'bg-purple-100 text-purple-800',
    posted: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const labels = {
    image_post: '🖼️ Image',
    video_post: '🎥 Video',
    reel: '📱 Reel',
    story: '⚡ Story'
  };

  return (
    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
      {labels[type as keyof typeof labels]}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons = {
    facebook: '👥 FB',
    instagram: '📷 IG',
    linkedin: '💼 LI',
    gmb: '📍 GMB',
    youtube: '▶️ YT'
  };

  return (
    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
      {icons[platform as keyof typeof icons]}
    </span>
  );
}

function AddContentForm({
  clientId,
  onClose,
  onSuccess
}: {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    contentType: 'image_post',
    scheduledDate: '',
    scheduledTime: '',
    hashtags: '',
    platforms: {
      facebook: true,
      instagram: true,
      linkedin: false,
      gmb: false,
      youtube: false
    },
    visualStyle: '',
    aiPrompt: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      const hashtags = formData.hashtags.split(',').map(tag => tag.trim()).filter(Boolean);

      await calendarApi.create({
        clientId,
        title: formData.title,
        caption: formData.caption,
        contentType: formData.contentType,
        scheduledAt: scheduledAt.toISOString(),
        hashtags,
        platforms: {
          facebook: { enabled: formData.platforms.facebook },
          instagram: { enabled: formData.platforms.instagram },
          linkedin: { enabled: formData.platforms.linkedin },
          gmb: { enabled: formData.platforms.gmb },
          youtube: { enabled: formData.platforms.youtube }
        },
        visualInstructions: {
          style: formData.visualStyle,
          aiPrompt: formData.aiPrompt
        }
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert('Failed to schedule post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Schedule New Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Summer Sale Announcement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption *
            </label>
            <textarea
              required
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="🌟 Big summer sale! Get 50% off on all items..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type *
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="image_post">Image Post</option>
                <option value="video_post">Video Post</option>
                <option value="reel">Reel</option>
                <option value="story">Story</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.hashtags}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="sale, summer, deals"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Time *
              </label>
              <input
                type="time"
                required
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platforms *
            </label>
            <div className="space-y-2">
              {Object.keys(formData.platforms).map((platform) => (
                <label key={platform} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.platforms[platform as keyof typeof formData.platforms]}
                    onChange={(e) => setFormData({
                      ...formData,
                      platforms: {
                        ...formData.platforms,
                        [platform]: e.target.checked
                      }
                    })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Prompt (optional)
            </label>
            <textarea
              value={formData.aiPrompt}
              onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Professional image of people shopping, modern style..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Describe what kind of image/video you want AI to generate
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
