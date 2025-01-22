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
