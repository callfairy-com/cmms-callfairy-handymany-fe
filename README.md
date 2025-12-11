# CRM Fairy Frontend 🧚‍♀️

A modern, beautiful CRM frontend built with React, TypeScript, and a unique Neumorphism/Neobrutalism design system. This frontend is designed to seamlessly integrate with the CRM Fairy Django backend.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Your CRM Fairy Django backend running on `http://localhost:8000`

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd "d:\CALLFAIRY-DEV\CRM frontend\frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file
   echo VITE_API_BASE_URL=http://localhost:8000 > .env
   echo VITE_APP_NAME="CRM Fairy" >> .env
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
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, Input)
│   │   └── Layout.tsx      # Main application layout
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── crm/            # CRM-related pages
│   │   ├── projects/       # Project management pages
│   │   ├── tasks/          # Task management pages
│   │   ├── reports/        # Analytics and reports
│   │   └── settings/       # Application settings
│   ├── stores/             # Zustand state management
│   │   └── authStore.ts    # Authentication state
│   ├── lib/                # Utilities and configurations
│   │   └── api.ts          # API client and types
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and design system
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Design System

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

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CRM Fairy
VITE_APP_VERSION=1.0.0
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
- Real-time business metrics
- Recent activity feed
- Quick action buttons
- Sales overview charts

### CRM Module
- **Clients**: Complete client management with categories
- **Leads**: Pipeline management with stages
- **Deals**: Opportunity tracking and conversion

### Project Management
- Project creation and tracking
- Task assignment and progress
- Timeline management

### Reports & Analytics
- Business intelligence dashboards
- Custom report generation
- Data visualization

## 🔐 Authentication Flow

1. User enters credentials on login page
2. Frontend sends request to `/api/v1/auth/login/`
3. Backend returns JWT tokens
4. Tokens stored securely in localStorage
5. Automatic token refresh on expiry
6. Protected routes redirect to login if unauthenticated

## 🎨 Customization

### Adding New Components

1. Create component in `src/components/ui/`
2. Follow the variant pattern (neu/brutal/hybrid)
3. Use TailwindCSS classes from the design system
4. Export from component index

### Extending the API

1. Add new types to `src/lib/api.ts`
2. Create API functions following the pattern
3. Use React Query for data fetching
4. Handle loading and error states

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
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🤝 Contributing

1. Follow the established code patterns
2. Use TypeScript for type safety
3. Follow the component variant system
4. Write meaningful commit messages
5. Test on multiple screen sizes

## 📄 License

This project is part of the CRM Fairy platform. See the main project license for details.

## 🎉 Getting Started

You now have a beautiful, modern CRM frontend that seamlessly integrates with your Django backend! The unique Neumorphism/Neobrutalism design will make your application stand out while providing an excellent user experience.

Start by running `npm install` and `npm run dev` to see your new frontend in action! 🚀
