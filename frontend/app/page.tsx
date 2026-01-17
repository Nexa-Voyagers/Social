import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            AutoUpload
          </h1>
          <p className="text-2xl text-gray-600">
            Smart Social Media Automation Platform
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Automate your content creation and multi-platform posting.
            Upload assets, define your content calendar, and let AI do the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">AI Content Generation</h3>
            <p className="text-gray-600">
              Automatically create branded image posts and engaging reels
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              30-day content calendars with automated posting
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">Multi-Platform</h3>
            <p className="text-gray-600">
              Post to Facebook, Instagram, LinkedIn, GMB, YouTube
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-12">
          <div className="flex gap-4 justify-center">
            <Link
              href="/clients"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/calendar"
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              View Calendar
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
              <h4 className="font-semibold mb-1">Add Clients</h4>
              <p className="text-sm text-gray-600">
                Create client profiles with branding (logos, colors, fonts)
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
              <h4 className="font-semibold mb-1">Upload Assets</h4>
              <p className="text-sm text-gray-600">
                Add all images, videos, and graphics for each client
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
              <h4 className="font-semibold mb-1">Create Calendar</h4>
              <p className="text-sm text-gray-600">
                Define 30-day content plan with captions, hashtags, and schedules
              </p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">4</div>
              <h4 className="font-semibold mb-1">Auto-Post</h4>
              <p className="text-sm text-gray-600">
                AI creates content and posts automatically across all platforms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
