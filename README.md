# Uni Village

A social networking mobile app for university students built with **React Native** and **Expo**.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo |
| Routing | Expo Router (file-based) |
| State | Zustand (global) + React Query (server) |
| Backend | Firebase |
| Language | TypeScript (strict mode) |

## Project Structure

```
uni-village/
├── app/                    # Expo Router - routing only
│   ├── (auth)/             # Auth routes
│   ├── (tabs)/             # Tab navigation (map, itinerary, community, profile)
│   ├── index.tsx           # Entry point - redirects to (tabs)/map
│   └── _layout.tsx         # Root layout
├── src/
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files
│   ├── features/           # Feature modules (feed, map, post, profile)
│   ├── lib/                # Infrastructure (api, storage, firebase, errors)
│   ├── providers/          # React Context providers
│   └── shared/             # Shared components, hooks, utils, types, constants
└── assets/                 # Static assets (images, fonts)
```

### Folder Details

| Folder | Purpose |
|--------|---------|
| `app/` | **Expo Router** - Contains only routing logic, no business logic |
| `src/components/` | **UI Components** - Reusable components (themed-text, themed-view, haptic-tab, etc.) |
| `src/config/` | **Configuration** - App config, environment variables |
| `src/features/` | **Feature Modules** - Independent modules: feed, map, post, profile |
| `src/lib/` | **Infrastructure** - API client, storage wrappers, Firebase client, error handling, monitoring |
| `src/providers/` | **Context Providers** - QueryProvider, ThemeProvider |
| `src/shared/` | **Shared Code** - Components (ui, layout, feedback), hooks, utils, types, constants |

### Feature Module Structure

Each feature in `src/features/` follows a consistent structure:

```
features/{name}/
├── components/     # Feature-specific UI components
├── hooks/          # React hooks (useQuery, useMutation)
├── services/       # Business logic layer
├── api/            # API calls (endpoints)
├── types/          # TypeScript types/interfaces
└── index.ts        # Public API exports
```

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env  # Add Firebase configuration

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

- [Expo Docs](https://docs.expo.dev/) • [React Native](https://reactnative.dev/) • [Firebase](https://firebase.google.com/docs)
