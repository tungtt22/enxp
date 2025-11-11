# ENXP Platform - UI Components

## Overview
Complete base UI system for the ENXP Platform with modern, professional design.

## Component Structure

### Core Layout Components (`/src/components/`)

#### 1. Layout.tsx
- **Layout**: Main wrapper component
- **Header**: Platform header with logo and branding
- **Sidebar**: Fixed sidebar for navigation
- **MainContent**: Content area wrapper
- **Footer**: Platform footer

#### 2. Navigation.tsx
- Dynamic navigation system
- Main navigation items
- Plugin-generated routes
- Active state highlighting
- Icon support

#### 3. Card.tsx
- **Card**: Generic card component with header/content
- **StatsCard**: Statistics display with icons and trends
- **Grid**: Responsive grid layout system

#### 4. StatusIndicator.tsx
- **StatusIndicator**: Status badges (online/offline/loading/error)
- **ServerStatus**: Backend server connection status display

## Pages

### Dashboard (/)
- Platform statistics overview
- 4 stat cards (Plugins, Endpoints, Status, Uptime)
- Feature highlights in 3-column grid
- System information panel

### Plugins (/plugins)
- Grid view of installed plugins
- Plugin cards with:
  - Name, version, type badge
  - API test response
  - Quick test link
- Instructions for creating new plugins

### Marketplace (/marketplace)
- Coming soon page
- Future features preview

### Settings (/settings)
- General settings form
- Notification preferences
- 2-column grid layout

## Design System

### Colors
- Primary Gradient: `#667eea → #764ba2`
- Success: `#4caf50`
- Error: `#f44336`
- Warning: `#ff9800`

### Typography
- Font Family: System fonts (-apple-system, Segoe UI, Roboto)
- Headings: 700 weight
- Body: 400-500 weight

### Spacing
- Base unit: rem-based
- Cards: 1.5rem padding
- Gaps: 1.5rem standard

### Shadows
- Small: `0 2px 8px rgba(0,0,0,0.08)`
- Medium: `0 4px 16px rgba(0,0,0,0.12)`
- Large: `0 4px 12px rgba(102,126,234,0.3)`

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 16px
- Pills: 20px

## Features

✅ Responsive grid layouts
✅ Hover animations and transitions
✅ Active navigation states
✅ Real-time server status
✅ Hot Module Replacement (HMR)
✅ Plugin route integration
✅ Component-based architecture
✅ Clean, modern design

## Integration with Plugin System

The UI seamlessly integrates with the ENXP plugin system:

1. **Plugin Routes**: Automatically added to navigation
2. **Menu Items**: Plugin-contributed menu items appear in sidebar
3. **Server Status**: Live backend connection monitoring
4. **Plugin Cards**: Display loaded plugins with test functionality

## Running the UI

```bash
# Start backend (port 3000)
npx ts-node /path/to/enxp/server.ts

# Start frontend (port 3002)
cd frontend-app
npm run dev
```

Access at: http://localhost:3002

## Next Steps

- [ ] Add plugin detail pages
- [ ] Implement plugin marketplace API
- [ ] Add user authentication
- [ ] Create plugin SDK documentation viewer
- [ ] Add dark mode support
- [ ] Implement real-time plugin updates via WebSocket
