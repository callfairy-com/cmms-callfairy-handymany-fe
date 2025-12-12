# CallFairy CMMS Frontend 🧚‍♀️

A modern, beautiful Computerized Maintenance Management System (CMMS) frontend built with React, TypeScript, and a unique Neumorphism/Neobrutalism design system. This frontend is designed to seamlessly integrate with the CallFairy CMMS Django backend.

## 🎨 Design Philosophy

This frontend combines two distinctive design approaches:

- **Neumorphism**: Soft, elegant UI with subtle shadows and depth
- **Neobrutalism**: Bold, high-contrast elements with strong typography and vibrant colors
- **Hybrid Components**: Unique blend of both styles for maximum visual impact

## ✨ Features

- 🔐 **JWT Authentication** with automatic token refresh
- 📱 **Responsive Design** optimized for all devices
- 🎭 **Multiple UI Variants** (Neumorphism, Brutal, Hybrid)
- ⚡ **Modern Tech Stack** (React 18, TypeScript, Vite)
- 🎨 **Custom Design System** with TailwindCSS
- 🔄 **Real-time Updates** with React Query
- 📊 **Dashboard Analytics** with beautiful charts
- 🎯 **Type-Safe API** integration with your Django backend
- 🏭 **Work Order Management** - Complete maintenance workflow
- 🔧 **Asset Tracking** - Monitor and maintain equipment
- 📍 **Site Management** - Multi-location support
- 📋 **Preventive Maintenance** - Scheduled maintenance tasks
- 🛡️ **Compliance & Safety** - Regulatory compliance tracking
- 💰 **Cost Tracking** - Financial management for maintenance
- 📄 **Document Management** - Centralized document storage
- 👥 **User Management** - Role-based access control
- 📈 **Reports & Analytics** - Business intelligence dashboards
- 💼 **Sales & Customer Management** - Client and lead tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Your CallFairy CMMS Django backend running on `http://localhost:8000`

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd /path/to/cmms-callfairy-handymany-fe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file
   echo VITE_API_BASE_URL=http://localhost:8000 > .env
   echo VITE_APP_NAME="CallFairy CMMS" >> .env
   echo VITE_APP_VERSION=1.0.0 >> .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🏗️ Project Structure

```
cmms-callfairy-handymany-fe/
├── src/
│   ├── app/                          # ✅ Application core
│   │   ├── main.tsx                  # ✅ Single entrypoint
│   │   ├── router.tsx                # ✅ Single router
│   │   ├── providers/                # ✅ Global state management
│   │   │   ├── AppProviders.tsx      # ✅ Unified provider wrapper
│   │   │   ├── AuthProvider.tsx      # ✅ Authentication context
│   │   │   ├── NotificationProvider.tsx # ✅ Notification system
│   │   │   ├── SettingsProvider.tsx  # ✅ App settings
│   │   │   └── OrganizationProvider.tsx # ✅ Organization data
│   │   └── layouts/
│   │       └── MainLayout.tsx        # ✅ Main application layout
│   │
│   ├── features/                     # ✅ 15 self-contained feature modules
│   │   ├── auth/                     # Authentication pages & components
│   │   ├── dashboard/                # Dashboard & analytics
│   │   ├── work-orders/              # Work order management
│   │   ├── assets/                   # Asset tracking & maintenance
│   │   ├── sites/                    # Site/location management
│   │   ├── maintenance/              # Preventive maintenance
│   │   ├── compliance/               # Compliance & safety
│   │   ├── cost-tracking/            # Financial management
│   │   ├── quotes/                   # Quote management
│   │   ├── variations/               # Variation tracking
│   │   ├── documents/                # Document management
│   │   ├── attendance/               # Attendance tracking
│   │   ├── reports/                  # Reporting & analytics
│   │   ├── users/                    # User management
│   │   └── settings/                 # Application settings
│   │
│   ├── components/                   # ✅ Shared UI components
│   │   ├── ui/                       # Base UI components (Button, Card, Input)
│   │   └── forms/                    # Form components
│   ├── hooks/                        # ✅ Shared React hooks
│   ├── lib/                          # ✅ Utilities and helpers
│   │   ├── api.ts                    # API client configuration
│   │   └── utils.ts                  # Utility functions
│   ├── types/                        # ✅ TypeScript type definitions
│   ├── config/                       # ✅ Configuration files
│   │   ├── env.ts                    # Environment variables
│   │   ├── navigation.tsx            # Navigation structure
│   │   ├── routes.ts                 # Route definitions
│   │   └── endpoints.ts              # API endpoints
│   ├── App.tsx                       # ✅ Main application component
│   ├── main.tsx                      # ✅ Application entry point
│   └── index.css                     # ✅ Global styles and design system
│
├── public/                           # Static assets
├── package.json                      # Dependencies and scripts
├── vite.config.ts                    # Vite configuration
├── tailwind.config.js                # TailwindCSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

## �️ Architecture Overview

### Feature-Based Structure

The application follows a **feature-based architecture** where each module is self-contained:

- **`features/[module]/pages/`** - Page components
- **`features/[module]/components/`** - Feature-specific components
- **`features/[module]/services/`** - API calls and data fetching
- **`features/[module]/hooks/`** - Feature-specific hooks
- **`features/[module]/types/`** - TypeScript types

### Provider Pattern

Global state is managed through **providers** in `src/app/providers/`:

- **AuthProvider** - Authentication and user management
- **NotificationProvider** - Toast notifications and alerts
- **SettingsProvider** - Application settings
- **OrganizationProvider** - Organization data and preferences

### Centralized Configuration

All configuration is centralized in `src/config/`:

- **`env.ts`** - Environment variable management
- **`navigation.tsx`** - Navigation structure and permissions
- **`routes.ts`** - Route definitions
- **`endpoints.ts`** - API endpoint definitions

## �� Design System

### Color Palette

```css
/* Neumorphism Colors */
--neu-50: #f8fafc
--neu-100: #f1f5f9
--neu-200: #e2e8f0
/* ... */

/* Neobrutalism Colors */
--brutal-yellow: #FFFF00
--brutal-pink: #FF00FF
--brutal-cyan: #00FFFF
--brutal-lime: #00FF00
```

### Component Variants

All components support three variants:

- `neu` - Soft neumorphic design
- `brutal` - Bold neobrutalist style  
- `hybrid` - Combination of both styles

```tsx
// Example usage
<Button variant="neu" color="primary">Neumorphic Button</Button>
<Button variant="brutal" color="primary">BRUTAL BUTTON</Button>
<Button variant="hybrid" color="primary">Hybrid Button</Button>
```

## 🔌 API Integration

The frontend automatically integrates with your Django backend:

### Authentication
- Login/logout functionality
- JWT token management
- Automatic token refresh
- Protected routes

### CRM Features
- Client management
- Lead tracking
- Deal pipeline
- Contact management

### Project Management
- Project creation and tracking
- Task assignment
- Progress monitoring

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CallFairy CMMS
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### Backend Integration

Ensure your Django backend is configured with CORS settings:

```python
# In your Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## 🎯 Key Features

### Dashboard
- Real-time maintenance metrics
- Recent activity feed
- Quick action buttons
- Work order overview charts
- Asset health monitoring

### Work Order Management
- **Work Orders**: Complete maintenance workflow management
- **Scheduling**: Calendar-based task scheduling
- **Assignments**: Technician assignment and tracking
- **Status Tracking**: Real-time status updates

### Asset Management
- **Asset Registry**: Comprehensive equipment tracking
- **Maintenance History**: Complete service records
- **Asset Health**: Condition monitoring and alerts
- **Depreciation**: Asset value tracking

### Site Management
- **Multi-location**: Support for multiple sites
- **Location Hierarchy**: Organized site structure
- **Site-specific Assets**: Location-based asset tracking

### Preventive Maintenance
- **Scheduled Tasks**: Automated maintenance scheduling
- **Checklists**: Standardized maintenance procedures
- **Compliance**: Regulatory compliance tracking

### Sales & Customer Management
- **Clients**: Complete client management with categories
- **Leads**: Pipeline management with stages
- **Deals**: Opportunity tracking and conversion

### Reports & Analytics
- **Maintenance Reports**: Detailed maintenance analytics
- **Cost Analysis**: Financial reporting and insights
- **Compliance Reports**: Safety and regulatory reports
- **Custom Reports**: Flexible report generation

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend sends request to `/api/v1/auth/login/`
3. Backend returns JWT tokens
4. Tokens stored securely in localStorage
5. Automatic token refresh on expiry
6. Protected routes redirect to login if unauthenticated

### Role-Based Access Control

The application supports role-based access control with the following roles:
- **superadmin**: Full system access
- **orgadmin**: Organization-level access
- **manager**: Management-level access
- **technician**: Maintenance technician access
- **contractor**: Contractor access
- **viewer**: Read-only access

### Permission System

Permissions are defined in `src/types/rbac.ts` and enforced through:
- Navigation visibility
- Route protection
- Component-level access control
- API endpoint authorization

## 🔄 Migration from Old Structure

If you're migrating from the previous CRM Fairy structure, here are the key import path changes:

### Provider (Context) Imports
```typescript
// ❌ Old
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

// ✅ New
import { useAuth } from '@/app/providers/AuthProvider'
import { useNotifications } from '@/app/providers/NotificationProvider'
```

### Page Imports
```typescript
// ❌ Old
import WorkOrders from '@/pages/cmms/WorkOrders'
import Dashboard from '@/pages/dashboard/Dashboard'

// ✅ New
import WorkOrdersPage from '@/features/work-orders/pages/WorkOrdersPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
```

### API Service Imports
```typescript
// ❌ Old
import { workOrderApi } from '@/features/workOrders/api/workOrderApi'

// ✅ New
import { workOrderApi } from '@/features/work-orders/services/workOrderApi'
```

### Layout Imports
```typescript
// ❌ Old
import { Layout } from '@/components/maintenance/Layout'
import { AppShell } from '@/layouts/AppShell'

// ✅ New
import { MainLayout } from '@/app/layouts/MainLayout'
```

### Router Configuration
```typescript
// ❌ Old - Multiple routers
import { Router } from '@/app/router'
import { MaintenanceRouter } from '@/maintenance/router'

// ✅ New - Single unified router
import { Router } from '@/app/router'
```

### Key Structural Changes
- **Single Entry Point**: All app initialization now happens in `src/app/main.tsx`
- **Unified Providers**: All providers wrapped in `src/app/providers/AppProviders.tsx`
- **Feature-Based Organization**: Each feature is self-contained in `src/features/[feature]/`
- **Centralized Configuration**: All config moved to `src/config/`
- **No More Dead Code**: Old files archived in `src/_legacy/` (can be deleted after testing)

## 🎨 Customization

### Adding New Features

1. Create feature directory in `src/features/[feature-name]/`
2. Follow the feature structure:
   - `pages/` - Page components
   - `components/` - Feature-specific components
   - `services/` - API calls
   - `hooks/` - Custom hooks
   - `types/` - TypeScript types
3. Add routes to `src/config/routes.ts`
4. Add navigation items to `src/config/navigation.tsx`
5. Export pages from `src/app/router.tsx`

### Adding New Components

1. Create component in `src/components/ui/`
2. Follow the variant pattern (neu/brutal/hybrid)
3. Use TailwindCSS classes from the design system
4. Export from component index

### Extending the API

1. Add new types to `src/types/`
2. Create API functions in feature `services/` directory
3. Add endpoints to `src/config/endpoints.ts`
4. Use React Query for data fetching
5. Handle loading and error states

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

The application is ready for deployment to modern hosting platforms:

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS settings allow frontend origin
2. **API Connection**: Check `VITE_API_BASE_URL` environment variable
3. **Build Errors**: Run `npm install` to ensure all dependencies are installed
4. **TypeScript Errors**: Run `npm run type-check` to identify issues

### Development Tips

- Use browser dev tools to inspect network requests
- Check console for JavaScript errors
- Verify backend API is running and accessible
- Use React Developer Tools for component debugging

## 📚 Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context + Providers
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Custom Notification System
- **Design System**: Custom Neumorphism/Neobrutalism
- **Type Safety**: Full TypeScript coverage

## 🤝 Contributing

1. Follow the established code patterns
2. Use TypeScript for type safety
3. Follow the component variant system
4. Write meaningful commit messages
5. Test on multiple screen sizes
6. Ensure all features follow the feature-based structure
7. Update documentation for new features
8. Test authentication and permissions

## 📄 License

This project is part of the CallFairy CMMS platform. See the main project license for details.

## 🎉 Getting Started

You now have a beautiful, modern CMMS frontend that seamlessly integrates with your Django backend! The unique Neumorphism/Neobrutalism design will make your application stand out while providing an excellent user experience.

### Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Next Steps

1. **Configure your backend** - Update `VITE_API_BASE_URL` in `.env`
2. **Test authentication** - Verify login/logout functionality
3. **Explore features** - Navigate through all modules
4. **Check permissions** - Test role-based access control
5. **Customize branding** - Update `VITE_APP_NAME` if needed

Start by running `npm install` and `npm run dev` to see your new CMMS frontend in action! 🚀

---

## 📖 Additional Documentation

For more detailed information about the architecture and migration:
- **`MIGRATION_COMPLETE.md`** - Complete migration summary
- **`QUICK_REFERENCE.md`** - Developer quick reference guide
- **`src/config/`** - Configuration files documentation
- **`src/types/`** - TypeScript type definitions
