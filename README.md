# Online Course Platform

A Next.js-based platform for hosting and managing online courses with video content and AI-powered features.

## Environment Variables

### Local Development
For local development, copy the `.env.example` to `.env.local` and fill in the appropriate values:

```bash
cp .env .env.local
```

### Vercel Deployment
For deployment to Vercel, you need to configure the following environment variables in the Vercel dashboard:

1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add the following environment variables:

#### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full URL of your deployed app (e.g., https://your-app.vercel.app) |
| `NEXTAUTH_SECRET` | Random string used to hash tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `DEEPSEEK_API_KEY` | API key for DeepSeek AI service |

#### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key for OpenAI services |
| `GEMINI_API_KEY` | API key for Google Gemini AI |
| `STRIPE_SECRET_KEY` | Stripe payment processing key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `STRIPE_PRICE_ID_BASIC` | Stripe price ID for basic plan |
| `STRIPE_PRICE_ID_PRO` | Stripe price ID for pro plan |
| `GOOGLE_DRIVE_CLIENT_EMAIL` | Google Drive service account email |
| `GOOGLE_DRIVE_PRIVATE_KEY` | Google Drive service account private key |
| `GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder ID for content |

### Getting Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set up the OAuth consent screen if needed
6. For "Application type" select "Web application"
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-domain.com/api/auth/callback/google`
8. Click "Create" to get your Client ID and Client Secret

### Getting DeepSeek API Key

1. Create an account at [DeepSeek AI](https://deepseek.ai/)
2. Navigate to your account settings
3. Generate a new API key
4. Copy the API key and add it to your environment variables

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Features

- 📺 Video playback support for YouTube and Google Drive
- 💬 Real-time chat with AI assistant
- 📱 Responsive design for all devices
- 🎯 Course progress tracking
- 🔍 Course search and filtering

## Tech Stack

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- shadcn/ui
- DeepSeek AI API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Twodragon0/online-course.git
cd online-course
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```
DATABASE_URL="your-database-url"
DEEPSEEK_API_KEY="your-api-key"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
