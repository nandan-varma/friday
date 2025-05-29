# Google Calendar Integration Setup

This project includes Google Calendar integration. To set it up:

## 1. Create Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API

## 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`

## 3. Download Credentials

1. Download the JSON file with your credentials
2. Add the entire JSON content as an environment variable `GOOGLE_CREDENTIALS`

## 4. Environment Variables

Add these to your `.env.local` file:

```env
# Google Calendar Integration
GOOGLE_CREDENTIALS={"web":{"client_id":"your-client-id","project_id":"your-project-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"your-client-secret","redirect_uris":["http://localhost:3000/auth/google/callback"]}}
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 5. File Structure

The following files are created for Google Calendar integration:

- `lib/calendar/google.ts` - Google Calendar service functions
- `app/api/integrations/google/` - API routes for OAuth flow
- `app/auth/google/callback/page.tsx` - OAuth callback handler
- Updated integrations page with real Google Calendar connection

## 6. Features

- OAuth 2.0 authentication flow
- List calendar events
- Create new events
- Update existing events  
- Delete events
- Connection status checking
- Automatic token refresh

## 7. Usage

1. Go to the Integrations page
2. Click "Connect" on Google Calendar
3. Authorize the application in the popup
4. The integration will be marked as connected
5. You can now sync events with Google Calendar
