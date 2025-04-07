# RunComp - Running Competition App

A modern web application for tracking and competing in running activities with friends. Built with Next.js and Supabase.

## Features

- 🏃‍♂️ Track running distance and time
- 📊 Leaderboard with total distance, runs, and pace metrics
- 👤 User profiles with customizable avatars
- 📱 Responsive design for all devices
- 🌓 Light/dark mode toggle
- 🔐 Secure authentication using Supabase Auth

## Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS 4
  - Shadcn UI Components (with Radix UI)

- **Backend**:
  - Supabase (Authentication, Database, Storage)
  - PostgreSQL (with Row Level Security)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) package manager
- [Supabase](https://supabase.com/) account and project

### Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Installation

```bash
# Install dependencies
bun install

# Run the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Database Schema

The application uses the following main tables:
- `profiles` - User profiles linked to Supabase Auth
- `runs` - Running activities with distance and time
- `leaderboard` - View that aggregates running stats for the leaderboard

## Development

### Adding Shadcn UI Components

```bash
bunx --bun shadcn@latest add button
bunx --bun shadcn@latest add card
# etc.
```

## Deployment

This Next.js app can be deployed on platforms like Vercel or any other service that supports Next.js applications.

```bash
# Build for production
bun run build

# Start production server
bun start
```

## Live Demo

Check out the live demo of RunComp at [https://runcomp.vercel.app](https://runcomp.vercel.app)

Experience the app without creating an account by using the demo credentials:
- Email: demo@example.com
- Password: demo123
