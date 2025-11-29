'use client';

import { useState } from 'react';
import { Bell, Mail, MessageSquare, Clock, CheckCircle2, Save, Loader2 } from 'lucide-react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'booking_confirmation',
    label: 'Booking Confirmation',
    description: 'Get notified when your booking is confirmed',
    email: true,
    sms: true,
    push: true,
  },
  {
    id: 'reminder_24h',
    label: '24-Hour Reminder',
    description: 'Receive a reminder 24 hours before your appointment',
    email: true,
    sms: true,
    push: true,
  },
  {
    id: 'reminder_1h',
    label: '1-Hour Reminder',
    description: 'Receive a reminder 1 hour before your appointment',
    email: false,
    sms: true,
    push: true,
  },
  {
    id: 'cancellation',
    label: 'Cancellation Notice',
    description: 'Get notified if your appointment is cancelled',
    email: true,
    sms: true,
    push: true,
  },
  {
    id: 'promotions',
    label: 'Promotions & Offers',
    description: 'Receive special offers and discounts',
    email: true,
    sms: false,
    push: false,
  },
  {
    id: 'review_request',
    label: 'Review Requests',
    description: 'Get prompted to leave a review after your appointment',
    email: true,
    sms: false,
    push: true,
  },
];

interface NotificationPreferencesProps {
  userId?: string;
  onSave?: (settings: NotificationSetting[]) => Promise<void>;
}

export default function NotificationPreferences({ userId, onSave }: NotificationPreferencesProps) {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSetting = (settingId: string, channel: 'email' | 'sms' | 'push') => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(settings);
      } else {
        // Mock save
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-500" />
            Notification Preferences
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            Choose how you want to be notified about your appointments
          </p>
        </div>
      </div>

      {/* Channel Headers */}
      <div className="grid grid-cols-4 gap-4 pb-2 border-b border-neutral-200">
        <div className="col-span-1"></div>
        <div className="text-center">
          <Mail className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
          <span className="text-xs font-medium text-neutral-500">Email</span>
        </div>
        <div className="text-center">
          <MessageSquare className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
          <span className="text-xs font-medium text-neutral-500">SMS</span>
        </div>
        <div className="text-center">
          <Bell className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
          <span className="text-xs font-medium text-neutral-500">Push</span>
        </div>
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-neutral-100">
            <div className="col-span-1">
              <div className="font-medium text-neutral-900">{setting.label}</div>
              <div className="text-xs text-neutral-500">{setting.description}</div>
            </div>
            <div className="text-center">
              <button
                onClick={() => toggleSetting(setting.id, 'email')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  setting.email ? 'bg-primary-500' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  setting.email ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => toggleSetting(setting.id, 'sms')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  setting.sms ? 'bg-primary-500' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  setting.sms ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => toggleSetting(setting.id, 'push')}
                className={`w-10 h-6 rounded-full transition-colors ${
                  setting.push ? 'bg-primary-500' : 'bg-neutral-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                  setting.push ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}
