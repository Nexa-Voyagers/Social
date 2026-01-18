'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { clientsApi } from '@/lib/api';

interface BusinessProfile {
  businessDescription: string;
  targetAudience: string;
  brandVoice: string;
  contentGoals: string[];
  industries: string[];
  keyMessages: string[];
  competitorUrls: string[];
  brandValues: string[];
}

interface ContentStrategy {
  contentThemes: string[];
  postingFrequency: number; // posts per day
  contentMix: {
    educational: number;
    promotional: number;
    engaging: number;
    inspirational: number;
  };
  hashtagStrategy: string[];
  callToActions: string[];
  visualStyle: string;
  toneGuidelines: string;
}

export function BusinessProfileTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [profile, setProfile] = useState<BusinessProfile>({
    businessDescription: '',
    targetAudience: '',
    brandVoice: '',
    contentGoals: [],
    industries: [],
    keyMessages: [],
    competitorUrls: [],
    brandValues: []
  });

  const [strategy, setStrategy] = useState<ContentStrategy>({
    contentThemes: [],
    postingFrequency: 1,
    contentMix: {
      educational: 40,
      promotional: 20,
      engaging: 30,
      inspirational: 10
    },
    hashtagStrategy: [],
    callToActions: [],
    visualStyle: '',
    toneGuidelines: ''
  });

  const [saving, setSaving] = useState(false);
  const [tempInput, setTempInput] = useState('');
  const [activeSection, setActiveSection] = useState<'profile' | 'strategy'>('profile');

  const handleSave = async () => {
    setSaving(true);
    try {
      await clientsApi.update(clientId, {
        businessProfile: profile,
        contentStrategy: strategy
      });
      alert('Business profile and strategy saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: keyof BusinessProfile | keyof ContentStrategy, value: string) => {
    if (!value.trim()) return;

    if (field in profile) {
      setProfile({
        ...profile,
        [field]: [...(profile[field as keyof BusinessProfile] as string[]), value]
      });
    } else {
      setStrategy({
        ...strategy,
        [field]: [...(strategy[field as keyof ContentStrategy] as string[]), value]
      });
    }
    setTempInput('');
  };

  const removeItem = (field: keyof BusinessProfile | keyof ContentStrategy, index: number) => {
    if (field in profile) {
      const arr = profile[field as keyof BusinessProfile] as string[];
      setProfile({
        ...profile,
        [field]: arr.filter((_, i) => i !== index)
      });
    } else {
      const arr = strategy[field as keyof ContentStrategy] as string[];
      setStrategy({
        ...strategy,
        [field]: arr.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Intelligence</h2>
            <p className="text-sm text-gray-600 mt-1">
              Teach the AI about {clientName}&apos;s business to generate perfect content automatically
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveSection('profile')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Business Profile
        </button>
        <button
          onClick={() => setActiveSection('strategy')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSection === 'strategy'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Content Strategy
        </button>
      </div>

      {/* Business Profile Section */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Business Overview</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  value={profile.businessDescription}
                  onChange={(e) => setProfile({ ...profile, businessDescription: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what the business does, its products/services, unique value proposition..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be detailed! This helps AI understand what content to create.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <textarea
                  value={profile.targetAudience}
                  onChange={(e) => setProfile({ ...profile, targetAudience: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Who are the ideal customers? Demographics, interests, pain points..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Voice & Tone *
                </label>
                <input
                  type="text"
                  value={profile.brandVoice}
                  onChange={(e) => setProfile({ ...profile, brandVoice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Professional, Casual, Fun, Authoritative, Friendly..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Content Goals</h3>
              <p className="text-sm text-gray-600">What should your content achieve?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('contentGoals', tempInput)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Increase brand awareness, Drive sales, Educate customers..."
                  />
                  <Button onClick={() => addItem('contentGoals', tempInput)}>Add Goal</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.contentGoals.map((goal, i) => (
                    <div key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {goal}
                      <button onClick={() => removeItem('contentGoals', i)} className="ml-1 hover:text-blue-900">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Key Messages</h3>
              <p className="text-sm text-gray-600">Core messages to communicate consistently</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addItem('keyMessages', tempInput)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Quality first, Customer-focused, Innovation leaders..."
                  />
                  <Button onClick={() => addItem('keyMessages', tempInput)}>Add Message</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.keyMessages.map((msg, i) => (
                    <div key={i} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {msg}
                      <button onClick={() => removeItem('keyMessages', i)} className="ml-1 hover:text-green-900">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Strategy Section */}
      {activeSection === 'strategy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">30-Day Content Strategy</h3>
              <p className="text-sm text-gray-600">Set it once, let AI generate daily content for 30 days</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Posting Frequency
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={strategy.postingFrequency}
                    onChange={(e) => setStrategy({ ...strategy, postingFrequency: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-2xl font-bold text-blue-600 w-16 text-center">
                    {strategy.postingFrequency}
                  </span>
                  <span className="text-sm text-gray-600">posts/day</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  AI will automatically generate {strategy.postingFrequency * 30} posts over 30 days
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Mix Distribution
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">📚 Educational: {strategy.contentMix.educational}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strategy.contentMix.educational}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        contentMix: { ...strategy.contentMix, educational: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">🎯 Promotional: {strategy.contentMix.promotional}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strategy.contentMix.promotional}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        contentMix: { ...strategy.contentMix, promotional: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">💬 Engaging: {strategy.contentMix.engaging}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strategy.contentMix.engaging}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        contentMix: { ...strategy.contentMix, engaging: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">✨ Inspirational: {strategy.contentMix.inspirational}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={strategy.contentMix.inspirational}
                      onChange={(e) => setStrategy({
                        ...strategy,
                        contentMix: { ...strategy.contentMix, inspirational: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Content Themes</h3>
              <p className="text-sm text-gray-600">Topics AI should create posts about</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('contentThemes', tempInput)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Product features, Customer success stories, Tips & tricks..."
                />
                <Button onClick={() => addItem('contentThemes', tempInput)}>Add Theme</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {strategy.contentThemes.map((theme, i) => (
                  <div key={i} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {theme}
                    <button onClick={() => removeItem('contentThemes', i)} className="ml-1 hover:text-purple-900">✕</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Hashtag Strategy</h3>
              <p className="text-sm text-gray-600">Hashtags to use in posts</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('hashtagStrategy', tempInput)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., #YourBrand, #Industry, #Trending..."
                />
                <Button onClick={() => addItem('hashtagStrategy', tempInput)}>Add Hashtag</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {strategy.hashtagStrategy.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1 bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                    <button onClick={() => removeItem('hashtagStrategy', i)} className="ml-1 hover:text-pink-900">✕</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Call-to-Actions</h3>
              <p className="text-sm text-gray-600">CTAs to include in posts</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addItem('callToActions', tempInput)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Visit our website, Shop now, Learn more..."
                />
                <Button onClick={() => addItem('callToActions', tempInput)}>Add CTA</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {strategy.callToActions.map((cta, i) => (
                  <div key={i} className="flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {cta}
                    <button onClick={() => removeItem('callToActions', i)} className="ml-1 hover:text-orange-900">✕</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 text-lg font-semibold"
        >
          {saving ? '💾 Saving...' : '🚀 Save & Start Auto-Generation'}
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 mb-2">🤖 What happens after you save?</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✅ AI learns your business and content strategy</li>
            <li>✅ Generates {strategy.postingFrequency * 30} unique posts for the next 30 days</li>
            <li>✅ Intelligently selects and enhances your uploaded images</li>
            <li>✅ Creates reels with your videos and branding</li>
            <li>✅ Posts automatically every day to all connected platforms</li>
            <li>✅ Optimizes posting times for maximum engagement</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
