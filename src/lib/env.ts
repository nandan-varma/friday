/**
 * Environment variable validation
 * Ensures all required environment variables are present and valid
 */

interface EnvConfig {
  DATABASE_URL: string
  AUTH_SECRET: string
  GOOGLE_CREDENTIALS: string
  GOOGLE_REDIRECT_URI: string
  OPENAI_API_KEY?: string
  NEXT_PUBLIC_APP_URL?: string
}

function validateEnvironment(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'GOOGLE_CREDENTIALS',
    'GOOGLE_REDIRECT_URI'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    )
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL!
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string')
  }

  // Validate GOOGLE_CREDENTIALS format
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!)
    if (!credentials.web?.client_id || !credentials.web?.client_secret) {
      throw new Error('Invalid GOOGLE_CREDENTIALS format')
    }
  } catch (error) {
    throw new Error('GOOGLE_CREDENTIALS must be valid JSON with web.client_id and web.client_secret')
  }

  // Validate GOOGLE_REDIRECT_URI format
  const redirectUri = process.env.GOOGLE_REDIRECT_URI!
  try {
    new URL(redirectUri)
  } catch {
    throw new Error('GOOGLE_REDIRECT_URI must be a valid URL')
  }

  // Validate AUTH_SECRET length
  if (process.env.AUTH_SECRET!.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters long')
  }

  return {
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: process.env.AUTH_SECRET!,
    GOOGLE_CREDENTIALS: process.env.GOOGLE_CREDENTIALS!,
    GOOGLE_REDIRECT_URI: redirectUri,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  }
}

// Validate environment on module load
export const env = validateEnvironment()

// Export individual variables for convenience
export const {
  DATABASE_URL,
  AUTH_SECRET,
  GOOGLE_CREDENTIALS,
  GOOGLE_REDIRECT_URI,
  OPENAI_API_KEY,
  NEXT_PUBLIC_APP_URL
} = env