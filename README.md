# Radly - Medical Report Generation Platform

A production-ready Next.js 15 + TypeScript application for AI-powered medical report generation with PWA capabilities.

## Features

- 🏥 **Medical Report Generation**: AI-powered report generation with customizable templates
- 🔐 **Authentication**: Google, Apple, and Magic Link authentication via Supabase
- 📱 **PWA Ready**: Progressive Web App with offline capabilities
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 📊 **Real-time Updates**: TanStack Query for efficient data fetching
- ✅ **Form Validation**: React Hook Form with Zod schema validation
- 🐳 **Docker Ready**: Multi-stage Docker build for production deployment
- 🧪 **Tested**: Unit tests for API client and validation schemas

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom brand colors
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Testing**: Jest + Testing Library
- **Deployment**: Docker + Docker Compose

## Brand Colors

- **Primary**: #0D2240 (Navy)
- **Hover**: #0A1B33
- **Text**: #0E1B2A
- **Muted**: #5A6B7B
- **Surface**: #F3F6F9
- **Accent**: #127C99

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd radly-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_EDGE_BASE=https://edge.radly.app
   NEXT_PUBLIC_PUBLIC_CLIENT_KEY=your_client_key
   NEXT_PUBLIC_APP_NAME=Radly
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── app/               # Protected app pages
│   ├── legal/             # Legal pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth-provider.tsx  # Authentication context
│   ├── auth-guard.tsx     # Route protection
│   └── providers.tsx      # App providers
├── lib/                   # Utility libraries
│   ├── api.ts            # API client with retry/timeout
│   ├── supabase.ts       # Supabase client
│   ├── schemas.ts        # Zod validation schemas
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── __tests__/            # Test files
```

## Key Features

### Authentication
- Google OAuth integration
- Apple OAuth integration  
- Magic Link email authentication
- Protected routes with AuthGuard
- Terms acceptance flow

### Report Generation
- Template selection and management
- Patient information forms
- Clinical findings input
- Real-time generation with polling
- DOCX export functionality

### PWA Capabilities
- Service worker ready
- App manifest configured
- Offline-first design
- Installable on mobile devices

### API Client
- Automatic retry logic
- Request timeout handling
- Authorization header injection
- Error handling with custom ApiError class

## Docker Deployment

### Build and Run with Docker

1. **Build the image**
   ```bash
   docker build -t radly-frontend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables for Docker

Set the following environment variables in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_EDGE_BASE=https://edge.radly.app
NEXT_PUBLIC_PUBLIC_CLIENT_KEY=your_client_key
NEXT_PUBLIC_APP_NAME=Radly
```

## Testing

Run the test suite:

```bash
npm test
```

The project includes:
- Unit tests for API client (timeout, retry, error handling)
- Zod schema validation tests
- Component testing setup with Jest and Testing Library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.