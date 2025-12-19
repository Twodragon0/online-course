# Online Course Platform

A modern online course platform built with Next.js 14, featuring video playback, chat functionality, and course management.

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
Create a `.env` file in the root directory. See [env.example](./env.example) for all required variables:
```
DATABASE_URL="your-database-url"
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Important**: `DEEPSEEK_API_KEY` is required for the chat feature. Get your API key from https://platform.deepseek.com

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## Deployment

For detailed deployment instructions, see:
- [Deployment Guide](./DEPLOYMENT-GUIDE.md) - Complete deployment guide
- [Vercel Environment Variables Setup](./VERCEL-ENV-SETUP.md) - Environment variables configuration

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables (see [VERCEL-ENV-SETUP.md](./VERCEL-ENV-SETUP.md))
4. **Important**: Make sure `DEEPSEEK_API_KEY` is set for chat functionality
5. Deploy!

## Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./DEPLOYMENT-GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
