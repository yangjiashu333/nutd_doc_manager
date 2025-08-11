# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Dev server**: `npm run dev` - Start Vite development server
- **Build**: `npm run build` - TypeScript compilation + Vite build
- **Lint**: `npm run lint` - Run ESLint
- **Format**: `npm run format` - Format code with Prettier
- **Test**: `npm run test` - Run Vitest tests
- **Test with coverage**: `npm run test:coverage` - Run tests with coverage report
- **Preview**: `npm run preview` - Preview production build

## Architecture Overview

This is a **React + TypeScript document management application** with Supabase backend:

### Key Technologies

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **State Management**: Zustand (auth state management in `src/models/auth.ts`)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4 + Radix UI components
- **Testing**: Vitest + V8 coverage

### Project Structure

- **`src/pages/`** - Main application pages (dashboard, dataset, code, paper, patent, chart)
- **`src/components/ui/`** - Reusable UI components (Radix-based)
- **`src/layouts/`** - Layout components with auth guards and error boundaries
- **`src/models/`** - Zustand stores (currently only auth)
- **`src/lib/`** - Utility functions and Supabase client configuration
- **`src/types/`** - TypeScript type definitions (including database types)
- **`tests/`** - Vitest test files with database setup
- **`supabase/`** - Database migrations and config

### Authentication & Authorization

- Uses **Zustand persist middleware** to maintain auth state across sessions
- **Role-based access** (admin/user roles defined in database types)
- **AuthGuard component** protects routes requiring authentication
- User profiles stored in `profiles` table with foreign key to Supabase auth users

### Database Integration

- **Type-safe database access** via generated types in `src/types/database.types.ts`
- Supabase client configured in `src/lib/supabase.ts` with auto token refresh
- Test environment uses local Supabase instance (configured in vite.config.ts)

### Testing Setup

- Tests run against local Supabase (port 54321)
- Coverage thresholds: 80% for branches/functions/lines/statements
- Test files located in `tests/` directory (not `src/`)
- Database test utilities in `tests/setup/`

## Path Aliases

- `@/` maps to `./src/` for cleaner imports

## Local Development

- Requires local Supabase instance for full functionality
- Environment variables for Supabase URL and keys (see vite.config.ts for test values)

## Rules

- 应用仅用于桌面端，不考虑移动端适配
- 使用shadcn中提供的组件，如果没有再自己实现
- 使用shadcn的design token
- 错误尽可能在services层处理
- 不在model层中处理错误，直接抛出
- 页面中处理错误时使用toast进行提示
