# CloudOps Frontend

Modern React.js + Vite SaaS frontend for automated AWS deployment platform with predictive cost engine.

## 🎨 Design System

- **Dark Mode First**: Glasmorphism UI inspired by Vercel and Railway
- **Responsive**: Mobile-first design system
- **Production-Ready**: Tailwind CSS with custom theme
- **Animations**: Framer Motion for smooth interactions

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite 5** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS 3** - Styling
- **Framer Motion 10** - Animations
- **React Router 6** - Routing
- **TanStack Query 5** - Server state management
- **Zustand 4** - Client state management
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Radix UI** - Accessible components

## 📁 Project Structure

```
src/
├── app/                    # Application shell
├── features/              # Feature modules (dashboard, deployment, etc)
├── components/            # Shared UI components
├── services/              # API & business logic
├── hooks/                 # Custom React hooks
├── context/               # React Context providers
├── store/                 # Zustand stores
├── lib/                   # Utilities & constants
├── styles/                # Global styles & design tokens
└── types/                 # TypeScript types
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Development server
npm run dev

# Production build
npm run build
```

## 🎨 Design Features

- **Color Scheme**: Primary (#6C63FF), Accent (#00D4FF), Success (#00C896), Error (#FF5D73)
- **Glassmorphism**: Frosted glass effect cards with backdrop blur
- **Responsive Grid**: Auto-fit grid layouts
- **Dark Mode**: Default dark theme with light mode support
- **Animations**: Smooth transitions and microinteractions

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code
- `npm run type-check` - TypeScript check

## 🔧 Configuration

All configs are production-ready:
- `vite.config.ts` - Optimized build
- `tailwind.config.ts` - Extended theme
- `tsconfig.json` - Strict TypeScript
- `.eslintrc.cjs` - Code standards
- `.prettierrc` - Code formatting

## 📖 Documentation

See individual files for detailed documentation on:
- **Styling**: `src/styles/globals.css` and `src/styles/tokens.css`
- **Components**: Start with component files in `src/components/`
- **Services**: API integration in `src/services/`
- **Hooks**: Custom hooks in `src/hooks/`

## 🔐 Security

- Environment-based configuration
- Secure token handling
- CORS support
- Input validation utilities

## 📄 License

MIT License

---
**Status**: Production-Ready  
**Last Updated**: May 2026

