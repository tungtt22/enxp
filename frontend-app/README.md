# ENXP Frontend App

Modern frontend application for the ENXP platform built with React, TypeScript, and Ant Design.

## 📁 Project Structure

```
frontend-app/
├── src/
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   │   ├── AppLayout.tsx # Main layout wrapper
│   │   │   ├── AppHeader.tsx # Application header
│   │   │   ├── AppSidebar.tsx# Collapsible sidebar with navigation
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── TemplatesPage.tsx
│   │   ├── ActivityPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── index.ts
│   ├── App.tsx               # Main app component
│   ├── App.css               # Global styles
│   ├── main.tsx              # Entry point
│   └── index.css
├── package.json
└── vite.config.ts

```

## 🚀 Tech Stack

- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Ant Design 5.28** - UI component library
- **React Router 6.20** - Routing
- **Vite 5.0** - Build tool
- **@enxp/core** - Plugin system core
- **@enxp/frontend** - Frontend plugin utilities

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

Server runs at `http://localhost:3001`

## 🏗️ Build

```bash
npm run build
```

## 🎨 Features

- ✅ Clean, modern UI with Ant Design
- ✅ Responsive layout with collapsible sidebar
- ✅ Type-safe with TypeScript
- ✅ Plugin-based architecture
- ✅ Dark theme sidebar navigation
- ✅ Icon-based menu with @ant-design/icons

## 📝 Code Organization

### Layout Components
All layout-related components are in `src/components/layout/`:
- `AppLayout` - Main layout container with sidebar and content area
- `AppHeader` - Header with search, notifications, and user menu
- `AppSidebar` - Navigation sidebar with menu items

### Pages
All page components are in `src/pages/`:
- Each page is a self-contained component
- Uses Ant Design components (Card, Empty, Form, etc.)
- Exported through `index.ts` for clean imports

## 🧹 Recent Cleanup

The codebase has been optimized by:
- ✅ Removed legacy components (Card, Navigation, StatusIndicator)
- ✅ Removed unused CSS files
- ✅ Simplified App.css to essential global styles
- ✅ Updated .gitignore for backup files
- ✅ Clean component structure with clear separation of concerns

## 🔌 Plugin System

The app integrates with `@enxp/core` plugin manager:
- Plugins can register routes dynamically
- Plugin menu items are supported
- See `App.tsx` for plugin integration example
