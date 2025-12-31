# Uni Village

A social networking mobile app for university students built with **React Native** and **Expo**.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo |
| Routing | Expo Router (file-based) |
| State | Zustand (global) + React Query (server) |
| Backend | Supabase |
| Language | TypeScript (strict mode) |

## Project Structure

```
uni-village/
├── app/                    # Expo Router - routing only
│   ├── (auth)/             # Auth routes
│   ├── (tabs)/             # Tab navigation
│   └── _layout.tsx         # Root layout
├── src/
│   ├── features/           # Feature modules (auth, feed, post, profile)
│   ├── shared/             # Shared components, hooks, utils, types
│   ├── lib/                # Infrastructure (api, storage, supabase)
│   ├── providers/          # React Context providers
│   └── config/             # Configuration files
└── assets/                 # Static assets
```

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env  # Add SUPABASE_URL and SUPABASE_ANON_KEY

# Run development server
npm start

# Platform-specific
npm run android | ios | web
```

## Architecture

This project follows **Feature-Based Architecture** with **Clean Architecture** principles.

### Dependency Flow
```
app/ → features/ → shared/ → lib/
```

### Key Rules
- **Feature Isolation**: Features don't import from each other directly
- **Services Layer**: Business logic in `services/`, not in screens
- **Type Safety**: Full TypeScript coverage with explicit types

## Adding a New Feature

```bash
mkdir -p src/features/{name}/{components,hooks,services,api,types}
```

Create `index.ts` to export only the public API.

## Resources

- [Expo Docs](https://docs.expo.dev/) • [React Native](https://reactnative.dev/) • [Supabase](https://supabase.com/docs)
