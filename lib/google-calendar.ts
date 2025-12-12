import { google, calendar_v3 } from 'googleapis';

// Google OAuth2 Client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/calendar/callback`
);

// Scopes required for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Generate the Google OAuth URL for calendar access
 */
export function getGoogleAuthUrl(state: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Create a calendar client with the given tokens
 */
export function getCalendarClient(accessToken: string, refreshToken?: string): calendar_v3.Calendar {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Refresh access token if needed
 */
export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchGoogleCalendarEvents(
  accessToken: string,
  refreshToken?: string,
  options?: {
    timeMin?: Date;
    timeMax?: Date;
    maxResults?: number;
    calendarId?: string;
  }
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const response = await calendar.events.list({
    calendarId: options?.calendarId || 'primary',
    timeMin: (options?.timeMin || now).toISOString(),
    timeMax: (options?.timeMax || oneMonthLater).toISOString(),
    maxResults: options?.maxResults || 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}

/**
 * Create a Google Calendar event
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    attendees?: string[];
  },
  refreshToken?: string,
  calendarId: string = 'primary'
): Promise<calendar_v3.Schema$Event> {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  });

  return response.data;
}

/**
 * Update a Google Calendar event
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: {
    summary?: string;
    description?: string;
    location?: string;
    start?: Date;
    end?: Date;
  },
  refreshToken?: string,
  calendarId: string = 'primary'
): Promise<calendar_v3.Schema$Event> {
  const calendar = getCalendarClient(accessToken, refreshToken);

  const requestBody: calendar_v3.Schema$Event = {};
  if (updates.summary) requestBody.summary = updates.summary;
  if (updates.description) requestBody.description = updates.description;
  if (updates.location) requestBody.location = updates.location;
  if (updates.start) {
    requestBody.start = {
      dateTime: updates.start.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  if (updates.end) {
    requestBody.end = {
      dateTime: updates.end.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody,
  });

  return response.data;
}

/**
 * Delete a Google Calendar event
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  eventId: string,
  refreshToken?: string,
  calendarId: string = 'primary'
): Promise<void> {
  const calendar = getCalendarClient(accessToken, refreshToken);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

/**
 * Convert a Google Calendar event to an appointment-like format
 */
export function convertGoogleEventToAppointment(event: calendar_v3.Schema$Event) {
  const startDateTime = event.start?.dateTime || event.start?.date;
  const endDateTime = event.end?.dateTime || event.end?.date;

  if (!startDateTime || !endDateTime) {
    return null;
  }

  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  // Extract customer info from attendees or description
  let customerName = '';
  let customerEmail = '';

  if (event.attendees && event.attendees.length > 0) {
    const firstAttendee = event.attendees[0];
    customerName = firstAttendee.displayName || '';
    customerEmail = firstAttendee.email || '';
  }

  // Try to parse customer info from event title
  // Format: "Service Name - Customer Name"
  const titleParts = (event.summary || '').split(' - ');
  const serviceName = titleParts[0] || event.summary || 'Imported Event';
  if (titleParts.length > 1 && !customerName) {
    customerName = titleParts.slice(1).join(' - ');
  }

  return {
    googleEventId: event.id,
    title: event.summary || 'Untitled Event',
    serviceName,
    customerName,
    customerEmail,
    description: event.description || '',
    location: event.location || '',
    startTime: startDate.toISOString(),
    endTime: endDate.toISOString(),
    date: startDate.toISOString().split('T')[0],
    duration: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)),
    source: 'google' as const,
    synced: true,
    status: event.status || 'confirmed',
  };
}

/**
 * Check if Google Calendar credentials are configured
 */
export function isGoogleCalendarConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
