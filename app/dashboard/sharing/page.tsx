'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Download, Share2, ExternalLink, QrCode, Link as LinkIcon, Check, Eye } from 'lucide-react';

export default function SharingCenterPage() {
  // In production, get provider ID from auth
  const providerId = '1'; // Mock provider ID
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${providerId}`;

  const [copied, setCopied] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQR = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `beautybook-qr-${providerId}.png`;
    link.href = url;
    link.click();
  };

  const handleShareWhatsApp = () => {
    const text = `预约我的服务，点击链接：${bookingUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareWeChat = () => {
    // WeChat sharing requires official SDK, show QR code instead
    alert('微信分享：请保存二维码分享给客户');
  };

  const handlePreview = () => {
    window.open(bookingUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">分享中心</h1>
          <p className="text-neutral-600">生成专属预约链接和二维码，分享给您的客户</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">专属二维码</h2>
                  <p className="text-sm text-neutral-600">扫码即可预约</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                <div ref={qrCodeRef} className="flex justify-center">
                  <QRCodeCanvas
                    value={bookingUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: '/logo.png',
                      height: 50,
                      width: 50,
                      excavate: true,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleDownloadQR}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                下载二维码
              </button>

              <p className="text-xs text-neutral-500 text-center mt-3">
                高清PNG格式，可用于打印或线上分享
              </p>
            </div>
          </div>

          {/* Link and Sharing Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Link */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">预约链接</h2>
                  <p className="text-sm text-neutral-600">复制链接分享给客户</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-neutral-600 mb-2">您的专属预约链接</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bookingUrl}
                    readOnly
                    className="flex-1 bg-white px-4 py-3 rounded-lg border border-neutral-200 text-neutral-900 font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handlePreview}
                className="w-full border-2 border-primary-200 text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                预览预约页面
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="card-glass">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-glow">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">快速分享</h2>
                  <p className="text-sm text-neutral-600">一键分享到社交平台</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={handleShareWhatsApp}
                  className="p-6 border-2 border-neutral-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-neutral-900">WhatsApp</p>
                      <p className="text-sm text-neutral-600">分享到 WhatsApp</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleShareWeChat}
                  className="p-6 border-2 border-neutral-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.273c-.019.063-.024.13-.024.198 0 .163.067.32.184.437.117.117.274.184.437.184a.67.67 0 0 0 .198-.024l1.273-.39a.59.59 0 0 1 .665.213c1.347 1.832 3.338 3.002 5.55 3.002 4.054 0 7.342-3.29 7.342-7.342 0-4.054-3.29-7.342-7.342-7.342zm-.665 11.528c-.117.117-.274.184-.437.184s-.32-.067-.437-.184L5.36 11.924c-.228-.228-.228-.597 0-.825.228-.228.597-.228.825 0l1.435 1.435 3.485-3.485c.228-.228.597-.228.825 0 .228.228.228.597 0 .825l-3.904 3.842z"/>
                        <path d="M23.677 13.253c0-3.41-2.855-6.173-6.376-6.173-3.52 0-6.375 2.763-6.375 6.173s2.855 6.173 6.375 6.173c1.024 0 1.988-.235 2.853-.658.098-.048.21-.073.323-.073.098 0 .196.018.289.055l1.411.542c.07.027.145.04.22.04.137 0 .27-.056.369-.154.098-.098.154-.231.154-.369a.67.67 0 0 0-.018-.178l-.333-1.058c-.048-.152-.009-.318.102-.432 1.163-1.193 1.833-2.771 1.833-4.444z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-neutral-900">微信</p>
                      <p className="text-sm text-neutral-600">分享到微信</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="card-glass bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">💡 使用建议</h3>
              <ul className="space-y-3 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>将二维码打印后放置在店铺显眼位置，方便顾客扫码预约</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>在社交媒体个人简介中添加预约链接，增加曝光率</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>通过微信、WhatsApp等直接发送给潜在客户</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>将链接添加到电子邮件签名和名片中</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>在 Instagram、Facebook 等社交平台的 Story 中分享二维码</span>
                </li>
              </ul>
            </div>

            {/* Stats Preview (Placeholder) */}
            <div className="card-glass">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">📊 分享数据</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">127</div>
                  <div className="text-sm text-neutral-600">链接访问</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">43</div>
                  <div className="text-sm text-neutral-600">扫码次数</div>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl text-center">
                  <div className="text-3xl font-bold gradient-text mb-1">18</div>
                  <div className="text-sm text-neutral-600">成功预约</div>
                </div>
              </div>
              <p className="text-xs text-neutral-500 text-center mt-4">
                数据统计功能即将上线
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
