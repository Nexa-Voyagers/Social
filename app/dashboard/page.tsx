'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { clientsApi, calendarApi, postsApi } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    scheduledPosts: 0,
    postedToday: 0,
    totalPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [clientsRes, calendarRes, postsRes] = await Promise.all([
        clientsApi.getAll(),
        calendarApi.getAll(),
        postsApi.getAll()
      ]);

      const clients = clientsRes.data.data || [];
      const calendar = calendarRes.data.data || [];
      const posts = postsRes.data.data || [];

      // Calculate stats
      const today = new Date().toDateString();
      const postedToday = posts.filter((p: any) =>
        new Date(p.publishedAt).toDateString() === today
      ).length;

      setStats({
        totalClients: clients.length,
        scheduledPosts: calendar.filter((c: any) => c.status === 'scheduled').length,
        postedToday,
        totalPosts: posts.length
      });

      // Get upcoming posts
      const upcoming = calendar
        .filter((c: any) => new Date(c.scheduledAt) > new Date())
        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 5);

      setUpcomingPosts(upcoming);

      // Get recent posts
      const recent = posts
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 5);

      setRecentPosts(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here&apos;s what&apos;s happening with your social media automation.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scheduled Posts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.scheduledPosts}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posted Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.postedToday}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPosts}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/clients">
                <Button variant="secondary" className="w-full">
                  👥 Add New Client
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="secondary" className="w-full">
                  📅 Schedule Post
                </Button>
              </Link>
              <Link href="/posts">
                <Button variant="secondary" className="w-full">
                  📊 View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Posts */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Upcoming Posts</h2>
            </CardHeader>
            <CardContent>
              {upcomingPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No upcoming posts scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPosts.map((post: any) => (
                    <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{post.caption}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(post.scheduledAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Recent Posts</h2>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No posts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post: any) => (
                    <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">
                          {post.platform.toUpperCase()}
                        </h3>
                        <a
                          href={post.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Post →
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.caption}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>👍 {post.analytics?.likes || 0}</span>
                        <span>💬 {post.analytics?.comments || 0}</span>
                        <span>🔄 {post.analytics?.shares || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
