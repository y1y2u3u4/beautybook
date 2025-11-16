'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode as QrCodeIcon } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  businessName: string;
  size?: number;
}

export default function QRCodeGenerator({ url, businessName, size = 300 }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {
    generateQRCode();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, size]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-booking-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
          <QrCodeIcon className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Your Booking QR Code</h3>
          <p className="text-sm text-neutral-600">Share this QR code to allow customers to book appointments</p>
        </div>
      </div>

      {qrCodeDataUrl ? (
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-neutral-100">
              <img
                src={qrCodeDataUrl}
                alt="Booking QR Code"
                className="w-64 h-64"
              />
              <p className="text-center text-sm font-medium text-neutral-700 mt-4">
                Scan to Book
              </p>
              <p className="text-center text-xs text-neutral-500">{businessName}</p>
            </div>
          </div>

          {/* Booking URL */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Booking Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-700 text-sm"
              />
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
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-2">Link copied to clipboard!</p>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download QR Code
          </button>

          {/* Usage Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">How to Use Your QR Code</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Print and display at your business location</li>
              <li>• Add to business cards and marketing materials</li>
              <li>• Share on social media and your website</li>
              <li>• Include in email signatures</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Generating QR code...</p>
          </div>
        </div>
      )}
    </div>
  );
}
