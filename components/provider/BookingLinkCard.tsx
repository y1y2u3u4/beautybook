'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink, Share2 } from 'lucide-react';

interface BookingLinkCardProps {
  url: string;
  slug: string;
  onSlugChange?: (newSlug: string) => void;
}

export default function BookingLinkCard({ url, slug, onSlugChange }: BookingLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(slug);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  const handleSaveSlug = () => {
    if (onSlugChange && newSlug && newSlug !== slug) {
      onSlugChange(newSlug);
    }
    setIsEditing(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book an Appointment',
          text: 'Book your appointment with us!',
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <ExternalLink className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Your Booking Page</h3>
          <p className="text-sm text-neutral-600">Share this link with customers</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* URL Display */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Public Booking URL
          </label>
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50">
              <p className="text-sm text-neutral-700 font-mono truncate">{url}</p>
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-neutral-600" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
          )}
        </div>

        {/* Custom Slug */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Custom URL Slug
          </label>
          {isEditing ? (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                <span className="px-4 py-3 bg-neutral-100 text-sm text-neutral-600 border-r border-neutral-200">
                  /book/
                </span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="flex-1 px-4 py-3 focus:outline-none"
                  placeholder="my-business"
                />
              </div>
              <button
                onClick={handleSaveSlug}
                className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewSlug(slug);
                }}
                className="px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50">
                <p className="text-sm text-neutral-700">
                  /book/<span className="font-semibold">{slug}</span>
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50"
              >
                Edit
              </button>
            </div>
          )}
          <p className="text-xs text-neutral-500 mt-2">
            Customize your booking page URL to make it memorable
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-center font-medium text-neutral-700"
          >
            Preview Page
          </a>
        </div>
      </div>
    </div>
  );
}
