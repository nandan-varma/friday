# GitHub Integration Setup

This guide explains how to set up the GitHub integration for Friday to track user activity for standup summaries.

## Prerequisites

- A GitHub account
- Admin access to create a GitHub OAuth App

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Friday Calendar (or your preferred name)
   - **Homepage URL**: `http://localhost:3000` (for development) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback` (for development)
4. Click "Register application"

## Step 2: Get OAuth Credentials

After creating the app:

1. Copy the **Client ID**
2. Click "Generate a new client secret" and copy the **Client Secret**
3. Store these securely - you'll need them for the next step

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
```

For production, update the redirect URI to your production domain:

```bash
GITHUB_REDIRECT_URI=https://your-domain.com/auth/github/callback
```

## Step 4: Update Database Schema

Run the database migration to add the GitHub integration table:

```bash
pnpm db:generate
pnpm db:migrate
```

## Step 5: Test the Integration

1. Start your development server: `pnpm dev`
2. Navigate to Settings: `http://localhost:3000/settings`
3. Click "Connect" under the GitHub integration section
4. Authorize the application on GitHub
5. You should be redirected back to the settings page with a success message

## OAuth Scopes Explained

The GitHub integration requests the following scopes:

- **`read:user`**: Read user profile information
- **`user:email`**: Access user email addresses
- **`repo`**: Full access to repositories (includes reading commits, issues, and pull requests)
- **`read:org`**: Read organization membership and teams
- **`read:project`**: Read access to projects

These scopes allow Friday to:

- Identify the user
- Read commits across all repositories
- Read issues and pull requests
- Read project activity
- Access organization-level information

## Security Notes

1. **Never commit** `.env` files to version control
2. Store OAuth secrets securely (use environment variables or secret management services)
3. Rotate OAuth secrets regularly
4. For production, use HTTPS for all OAuth redirects
5. Consider implementing rate limiting on your API endpoints

## API Endpoints

The following API endpoints are available:

- `POST /api/integrations/github` - Initiate OAuth flow
- `GET /api/integrations/github` - Get integration status
- `DELETE /api/integrations/github` - Disconnect integration
- `POST /api/integrations/github/callback` - Handle OAuth callback

## Using the GitHub Client

To fetch GitHub data for a user:

```typescript
import { getGithubClient } from "@/lib/github-oauth";

// Get authenticated client
const client = await getGithubClient(userId);

// Fetch user's repositories
const repos = await client.fetch("/user/repos");

// Fetch user's recent commits
const events = await client.fetch("/users/username/events");

// Fetch pull requests
const pulls = await client.fetch("/repos/owner/repo/pulls");
```

## Troubleshooting

### "Unauthorized" Error

- Verify that your OAuth credentials are correct
- Ensure the user is signed in before attempting to connect GitHub
- Check that the redirect URI matches exactly (including protocol and trailing slashes)

### "Failed to exchange code for token"

- Verify your `GITHUB_CLIENT_SECRET` is correct
- Ensure the authorization code hasn't expired (they're single-use and time-limited)
- Check that your redirect URI is registered correctly in GitHub

### Token Expiry Issues

GitHub OAuth tokens don't expire by default, but if you're using GitHub Apps with token expiration enabled, the library will automatically refresh tokens when needed.

## Next Steps

After setting up the GitHub integration, you can:

1. Create sync jobs to fetch and store GitHub activity
2. Build standup summary features that aggregate commits, PRs, and issues
3. Display GitHub activity in the calendar view
4. Create notifications for important GitHub events
