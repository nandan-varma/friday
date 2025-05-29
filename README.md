# Friday - AI-Powered Calendar Assistant

Friday is a modern, AI-powered calendar application built with Next.js, featuring Google Calendar integration, intelligent event scheduling, and a beautiful, responsive interface.

## Features

- 🗓️ **Calendar Management** - Create, edit, and manage events with an intuitive interface
- 🤖 **AI Assistant** - Get intelligent suggestions for scheduling and event management
- 🔗 **Google Calendar Integration** - Seamlessly sync with your Google Calendar
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- 🔐 **Secure Authentication** - Built-in user authentication and authorization
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS and shadcn/ui
- 🌙 **Dark Mode** - Full dark mode support
- ⚡ **Fast Performance** - Built with Next.js 15 for optimal performance

## Google Calendar Integration

This application includes full Google Calendar integration with OAuth 2.0 authentication. Users can:

- Connect their Google Calendar account securely
- View Google Calendar events in the dashboard
- Sync events between the app and Google Calendar
- Create, update, and delete events on both platforms

### Setup Google Calendar Integration

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API

2. **Create OAuth 2.0 Credentials**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://yourdomain.com/auth/google/callback`

3. **Configure Environment Variables**
   ```env
   GOOGLE_CREDENTIALS={"web":{"client_id":"your-client-id","project_id":"your-project-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"your-client-secret","redirect_uris":["http://localhost:3000/auth/google/callback"]}}
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Drizzle ORM with your preferred database
- **Authentication**: Custom auth implementation
- **AI**: OpenAI integration
- **Calendar**: Google Calendar API
- **State Management**: React hooks
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A database (PostgreSQL, MySQL, SQLite)
- Google Cloud Console access for Calendar integration
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd friday
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL="your-database-url"
   AUTH_SECRET="your-auth-secret"
   OPENAI_API_KEY="your-openai-api-key"
   GOOGLE_CREDENTIALS="your-google-credentials-json"
   GOOGLE_REDIRECT_URI="http://localhost:3000/auth/google/callback"
   ```

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Google Calendar Setup

1. Go to the Integrations page in the app
2. Click "Connect" next to Google Calendar
3. Complete the OAuth flow in the popup window
4. Your Google Calendar events will now appear in the dashboard

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages
│   ├── (dashboard)/              # Dashboard layout and pages
│   ├── api/                      # API routes
│   └── auth/google/callback/     # Google OAuth callback
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui components
│   ├── calendar/                 # Calendar-specific components
│   └── dashboard/                # Dashboard components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions and configurations
│   ├── calendar/                 # Calendar integration logic
│   └── db/                       # Database schema and connections
└── public/                       # Static assets
```

## API Endpoints

### Google Calendar Integration
- `GET /api/integrations/google/auth` - Get OAuth authorization URL
- `POST /api/integrations/google/callback` - Handle OAuth callback
- `GET /api/integrations/google/status` - Check connection status
- `GET /api/integrations/google/events` - Fetch Google Calendar events

### Events
- `GET /api/events` - Get user events
- `POST /api/events` - Create new event
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

### AI Features
- `POST /api/chat` - AI assistant chat
- `POST /api/ai/parse-event` - Parse natural language to event
- `POST /api/ai/suggest-time` - Get time suggestions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the [setup documentation](./GOOGLE_CALENDAR_SETUP.md)
2. Review the environment variable configuration
3. Ensure all required APIs are enabled in Google Cloud Console

For Google Calendar integration issues, verify:
- OAuth credentials are correctly configured
- Redirect URIs match your environment
- Google Calendar API is enabled
- Credentials JSON is properly formatted in environment variables
