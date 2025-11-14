import { google } from 'googleapis';

/**
 * Google Calendar Integration for BeautyBook
 *
 * This service creates and manages calendar events for appointments.
 * Uses Google Calendar API v3 with service account authentication.
 *
 * Setup:
 * 1. Create a Google Cloud Project
 * 2. Enable Google Calendar API
 * 3. Create a Service Account
 * 4. Download the JSON key file
 * 5. Share your calendar with the service account email
 * 6. Add credentials to .env
 */

// Lazy initialization to prevent build errors
let calendar: ReturnType<typeof google.calendar> | null = null;

function getCalendar() {
  if (!calendar && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      calendar = google.calendar({ version: 'v3', auth });
    } catch (error) {
      console.error('Error initializing Google Calendar:', error);
      return null;
    }
  }
  return calendar;
}

export interface CalendarEventData {
  appointmentId: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  amount: number;
  notes?: string;
}

/**
 * Create a Google Calendar event for an appointment
 * Returns the event ID if successful, null if calendar not configured
 */
export async function createCalendarEvent(
  data: CalendarEventData
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const calendarClient = getCalendar();

  if (!calendarClient) {
    console.warn('Google Calendar not configured, skipping event creation');
    return { success: false, error: 'Calendar not configured' };
  }

  if (!process.env.GOOGLE_CALENDAR_ID) {
    console.warn('GOOGLE_CALENDAR_ID not set, skipping event creation');
    return { success: false, error: 'Calendar ID not configured' };
  }

  try {
    // Parse the date and times to create ISO datetime strings
    const appointmentDate = new Date(data.date);
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
    const day = String(appointmentDate.getDate()).padStart(2, '0');

    // Convert time strings (e.g., "14:00") to ISO datetime
    const startDateTime = `${year}-${month}-${day}T${data.startTime}:00`;
    const endDateTime = `${year}-${month}-${day}T${data.endTime}:00`;

    // Create event description with appointment details
    const description = `
预约ID: ${data.appointmentId}
客户: ${data.customerName}
服务: ${data.serviceName}
费用: $${data.amount.toFixed(2)}
${data.notes ? `\n备注: ${data.notes}` : ''}

由BeautyBook自动创建
    `.trim();

    const event = {
      summary: `${data.serviceName} - ${data.customerName}`,
      description,
      location: data.providerName,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/New_York', // TODO: Make timezone configurable
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: data.customerEmail, displayName: data.customerName },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
      colorId: '9', // Blue color for appointments
    };

    const response = await calendarClient.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event,
      sendUpdates: 'all', // Send email invitations to attendees
    });

    console.log('Calendar event created:', response.data.id);

    return {
      success: true,
      eventId: response.data.id || undefined,
    };
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Update a Google Calendar event
 */
export async function updateCalendarEvent(
  eventId: string,
  data: Partial<CalendarEventData>
): Promise<{ success: boolean; error?: string }> {
  const calendarClient = getCalendar();

  if (!calendarClient || !process.env.GOOGLE_CALENDAR_ID) {
    console.warn('Google Calendar not configured, skipping event update');
    return { success: false, error: 'Calendar not configured' };
  }

  try {
    // Build update object based on provided data
    const updateData: any = {};

    if (data.date && data.startTime && data.endTime) {
      const appointmentDate = new Date(data.date);
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentDate.getDate()).padStart(2, '0');

      updateData.start = {
        dateTime: `${year}-${month}-${day}T${data.startTime}:00`,
        timeZone: 'America/New_York',
      };
      updateData.end = {
        dateTime: `${year}-${month}-${day}T${data.endTime}:00`,
        timeZone: 'America/New_York',
      };
    }

    if (data.serviceName && data.customerName) {
      updateData.summary = `${data.serviceName} - ${data.customerName}`;
    }

    const response = await calendarClient.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });

    console.log('Calendar event updated:', eventId);

    return { success: true };
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete a Google Calendar event
 */
export async function deleteCalendarEvent(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  const calendarClient = getCalendar();

  if (!calendarClient || !process.env.GOOGLE_CALENDAR_ID) {
    console.warn('Google Calendar not configured, skipping event deletion');
    return { success: false, error: 'Calendar not configured' };
  }

  try {
    await calendarClient.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      sendUpdates: 'all', // Notify attendees of cancellation
    });

    console.log('Calendar event deleted:', eventId);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get a calendar event by ID
 */
export async function getCalendarEvent(eventId: string) {
  const calendarClient = getCalendar();

  if (!calendarClient || !process.env.GOOGLE_CALENDAR_ID) {
    return null;
  }

  try {
    const response = await calendarClient.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    });

    return response.data;
  } catch (error: any) {
    console.error('Error getting calendar event:', error);
    return null;
  }
}
