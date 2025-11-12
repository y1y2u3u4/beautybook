'use client';

import { useState } from 'react';
import { Share2, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ShareButtonProps {
  providerId: string;
  providerName: string;
  variant?: 'default' | 'compact';
}

export default function ShareButton({ providerId, providerName, variant = 'default' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${providerId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `预约 ${providerName}`,
          text: `点击链接预约 ${providerName} 的服务`,
          url: bookingUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={handleShare}
          className="p-2 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
          title="分享"
        >
          <Share2 className="w-5 h-5 text-neutral-600" />
        </button>

        {showMenu && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 z-50">
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                copied
                  ? 'bg-green-50 text-green-600'
                  : 'hover:bg-primary-50 text-neutral-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">已复制链接</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">复制预约链接</span>
                </>
              )}
            </button>
            <Link
              href={`/dashboard/sharing`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all"
            >
              <QrCode className="w-5 h-5" />
              <span className="font-medium">查看二维码</span>
            </Link>
            <Link
              href={bookingUrl}
              target="_blank"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">预览页面</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl font-semibold hover:shadow-glow-lg transition-all"
      >
        <Share2 className="w-5 h-5" />
        分享我的预约页面
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 p-4 z-50">
          <p className="text-sm text-neutral-600 mb-3">分享您的专属预约链接</p>

          <div className="bg-neutral-50 px-3 py-2 rounded-lg mb-3 font-mono text-xs text-neutral-700 break-all">
            {bookingUrl}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                copied
                  ? 'bg-green-50 text-green-600'
                  : 'hover:bg-primary-50 text-neutral-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="font-medium">已复制到剪贴板</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="font-medium">复制链接</span>
                </>
              )}
            </button>

            <Link
              href={`/dashboard/sharing`}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all"
            >
              <QrCode className="w-5 h-5" />
              <span className="font-medium">生成二维码</span>
            </Link>

            <Link
              href={bookingUrl}
              target="_blank"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-medium">预览我的预约页面</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
