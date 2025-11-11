# Study Path

A comprehensive learning platform featuring an interactive study flow system, built with modern web technologies and mobile applications.

## Project Overview

This monorepo contains:
- **Mobile App** (`study-path/`): React Native/Expo application for mobile learning
- **Web App** (`web/`): Vite-based web application for desktop learning
- **Backend** (`supabase/`): Supabase-powered database and authentication
- **Shared** (`shared/`): Common types, utilities, and configurations

## Features

- Interactive learning flows with progress tracking
- User authentication and profiles
- Story-based content delivery
- Subscription management
- Cross-platform compatibility (mobile & web)
- Real-time data synchronization

## Tech Stack

- **Frontend**: React, TypeScript, Expo (mobile), Vite (web)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Database**: Drizzle ORM with PostgreSQL
- **Styling**: Tailwind CSS, NativeWind
- **State Management**: React Context
- **Build Tools**: esbuild, EAS

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (for mobile development)
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd STUDY_PATH
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

### Mobile App Setup

1. Navigate to the mobile app directory:
   ```bash
   cd study-path
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `expo-env.d.ts` and set up your Supabase keys

4. Start the development server:
   ```bash
   npx expo start
   ```

### Web App Setup

1. Navigate to the web app directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `env.example` to `.env` and fill in your Supabase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Navigate to the Supabase directory:
   ```bash
   cd supabase
   ```

2. Follow the setup guide in `SUPABASE_GUIDE.md`

3. Run migrations:
   ```bash
   supabase db reset
   ```

## Project Structure

```
STUDY_PATH/
├── docs/                    # Documentation
├── shared/                  # Shared types and utilities
│   ├── database.types.ts    # Database type definitions
├── study-path/              # Mobile application
│   ├── app/                 # App screens and navigation
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Database services and utilities
│   └── supabase/            # Supabase configuration
├── supabase/                # Backend configuration
│   ├── migrations/          # Database migrations
│   └── seed.sql             # Database seed data
└── web/                     # Web application
    ├── src/                 # Source code
    │   ├── components/      # UI components
    │   ├── pages/           # Page components
    │   └── services/        # API services
    └── public/              # Static assets
```

## Development

### Available Scripts

- `npm run build` - Build the web application
- `npm run dev` - Start web development server
- `npx expo start` - Start mobile development server

### Code Quality

- ESLint for code linting
- TypeScript for type checking
- Prettier for code formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please check the documentation in the `docs/` folder or create an issue in the repository.