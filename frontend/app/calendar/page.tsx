'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { calendarApi, clientsApi } from '@/lib/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { clsx } from 'clsx';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [calendarRes, clientsRes] = await Promise.all([
        calendarApi.getAll(),
        clientsApi.getAll()
      ]);

      setPosts(calendarRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDate = (date: Date) => {
    return posts.filter((post) =>
      isSameDay(new Date(post.scheduledAt), date)
    );
  };

  const selectedDatePosts = selectedDate ? getPostsForDate(selectedDate) : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all scheduled posts across all clients
            </p>
          </div>
          <Button onClick={() => window.location.href = '/clients'}>
            + Schedule New Post
          </Button>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                >
                  ← Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                >
                  Next →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-700"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {daysInMonth.map((date) => {
                const dayPosts = getPostsForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={clsx(
                      'bg-white p-2 min-h-24 cursor-pointer hover:bg-gray-50 transition-colors',
                      isSelected && 'ring-2 ring-blue-500',
                      isTodayDate && 'bg-blue-50'
                    )}
                  >
                    <div className={clsx(
                      'text-sm font-medium mb-1',
                      isTodayDate ? 'text-blue-600' : 'text-gray-900'
                    )}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded truncate"
                          title={post.title}
                        >
                          {post.title}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Posts */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Posts for {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
            </CardHeader>
            <CardContent>
              {selectedDatePosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No posts scheduled for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDatePosts.map((post) => {
                    const client = clients.find(c => c.id === post.clientId);
                    return (
                      <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {client && (
                                <span className="text-sm font-medium text-gray-600">
                                  {client.name}
                                </span>
                              )}
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {post.contentType}
                              </span>
                              <span className={clsx(
                                'text-xs px-2 py-1 rounded',
                                post.status === 'posted' ? 'bg-green-100 text-green-800' :
                                post.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              )}>
                                {post.status}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{post.title}</h4>
                            <p className="text-sm text-gray-700 mb-2">{post.caption}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>🕐 {format(new Date(post.scheduledAt), 'hh:mm a')}</span>
                              {post.hashtags?.length > 0 && (
                                <span># {post.hashtags.length} hashtags</span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
