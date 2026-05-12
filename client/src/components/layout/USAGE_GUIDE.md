# Navbar Component - Usage Guide

## Quick Start

### Basic Implementation

```tsx
import { Navbar } from '@/components/layout';

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Your page content */}
      </main>
    </>
  );
}
```

### Using Layout Wrapper

```tsx
import { Layout } from '@/components/layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1>Dashboard</h1>
        {/* Content here */}
      </div>
    </Layout>
  );
}
```

## Component API

### Navbar Component

```tsx
interface NavbarProps {
  // No required props - works out of the box
}
```

**Features:**
- ✅ Auto-detects scroll position
- ✅ Responsive mobile menu
- ✅ Smooth animations
- ✅ Glassmorphism design
- ✅ WCAG 2.1 compliant

### Layout Component

```tsx
interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;      // Default: true
  className?: string;        // Additional CSS classes
}
```

**Example with Props:**

```tsx
import { Layout } from '@/components/layout';

export default function CustomPage() {
  return (
    <Layout 
      showNavbar={true}
      className="bg-gradient-to-b from-primary to-background"
    >
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold">Welcome</h1>
      </div>
    </Layout>
  );
}
```

### Logo Component

```tsx
interface LogoProps {
  // No props - renders CloudOps branding
}
```

## Styling & Customization

### Using Tailwind CSS

```tsx
export default function StyledPage() {
  return (
    <Layout className="dark">
      <div className="space-y-4 p-8">
        <h1 className="text-3xl font-bold text-primary">
          Styled Content
        </h1>
        <p className="text-text-secondary">
          Using Tailwind classes with design tokens
        </p>
      </div>
    </Layout>
  );
}
```

### Custom Navbar Styling

Edit `Navbar.css` to customize:

```css
/* Change navbar background opacity */
.navbar-glass {
  background: rgba(19, 26, 42, 0.85); /* Increase from 0.6 */
  backdrop-filter: blur(20px);        /* Increase blur */
}

/* Change link hover color */
.nav-link:hover {
  color: var(--color-accent);
}

/* Adjust mobile menu width */
@media (max-width: 768px) {
  .navbar-mobile-menu {
    width: 90%;  /* Increase from 80% */
  }
}
```

### CSS Variable Overrides

Override design tokens in `src/styles/tokens.css`:

```css
:root {
  /* Brand colors */
  --color-primary: #6C63FF;    /* Purple */
  --color-accent: #00D4FF;     /* Cyan */
  
  /* Animation durations */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
}
```

## Advanced Usage

### Dynamic Navbar with React Router

```tsx
import { Layout } from '@/components/layout';
import { useLocation } from 'react-router-dom';

export default function DynamicLayout({ children }) {
  const location = useLocation();
  
  // Hide navbar on login page
  const showNavbar = !location.pathname.includes('/login');
  
  return (
    <Layout showNavbar={showNavbar}>
      {children}
    </Layout>
  );
}
```

### With Authentication Context

```tsx
import { Layout } from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';

export default function ProtectedPage() {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1>Welcome, {user?.name}!</h1>
      </div>
    </Layout>
  );
}
```

### Multiple Page Layouts

```tsx
import { Layout } from '@/components/layout';

// Marketing pages
export default function MarketingPage() {
  return (
    <Layout className="bg-gradient-to-b from-primary/10 to-background">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
    </Layout>
  );
}

// App pages
export default function AppPage() {
  return (
    <Layout className="bg-background">
      <Sidebar />
      <MainContent />
    </Layout>
  );
}
```

## Responsive Patterns

### Mobile-First Navigation

```tsx
export default function ResponsivePage() {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">Card 1</div>
        <div className="card">Card 2</div>
        <div className="card">Card 3</div>
      </div>
    </Layout>
  );
}
```

### Adapting Content Below Navbar

```tsx
export default function ContentPage() {
  return (
    <Layout>
      {/* Navbar is fixed at top (z-50) */}
      
      {/* Add padding-top to account for navbar height */}
      <main className="pt-20 px-4 md:px-8">
        <h1>Page Title</h1>
        <p>Content goes here...</p>
      </main>
    </Layout>
  );
}
```

## Animation Customization

### Changing Animation Duration

Edit `Navbar.tsx` to adjust Framer Motion props:

```tsx
// Original
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>

// Faster
<motion.div
  transition={{ duration: 0.15 }}
>

// Slower
<motion.div
  transition={{ duration: 0.5 }}
>
```

### Custom Animation Effects

```tsx
// In your page component
import { motion } from 'framer-motion';

export default function AnimatedPage() {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8"
      >
        <h1>Animated Content</h1>
      </motion.div>
    </Layout>
  );
}
```

## Accessibility Best Practices

### Adding ARIA Labels

```tsx
export default function AccessiblePage() {
  return (
    <Layout>
      <main aria-label="Main content">
        <h1 id="page-title">Page Title</h1>
        <section aria-labelledby="page-title">
          {/* Content */}
        </section>
      </main>
    </Layout>
  );
}
```

### Keyboard Navigation

```tsx
export default function KeyboardNavPage() {
  return (
    <Layout>
      <div className="space-y-4">
        <button className="focus:outline-none focus:ring-2 focus:ring-primary">
          Clickable Button
        </button>
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
      </div>
    </Layout>
  );
}
```

### Skip Navigation Link

```tsx
export default function PageWithSkipLink() {
  return (
    <Layout>
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
      
      <main id="main-content" className="container mx-auto py-8">
        {/* Main content */}
      </main>
    </Layout>
  );
}
```

## Performance Tips

### Lazy Loading Content

```tsx
import { Suspense, lazy } from 'react';
import { Layout } from '@/components/layout';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function OptimizedPage() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <HeavyComponent />
      </Suspense>
    </Layout>
  );
}
```

### Memoizing Components

```tsx
import { memo } from 'react';
import { Layout } from '@/components/layout';

const StaticSection = memo(() => (
  <div className="bg-surface rounded-lg p-8">
    Static content that doesn't change
  </div>
));

export default function Page() {
  return (
    <Layout>
      <StaticSection />
      <DynamicSection />
    </Layout>
  );
}
```

### Code Splitting by Route

```tsx
// In router configuration
import { lazy } from 'react';

const DashboardPage = lazy(() => import('./pages/Dashboard'));
const DeploymentPage = lazy(() => import('./pages/Deployment'));

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/deployments', component: DeploymentPage },
];
```

## Common Patterns

### Authentication Flow

```tsx
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout';

export default function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);
  
  if (loading) return <LoadingPage />;
  
  return (
    <Layout>
      <div>Protected content</div>
    </Layout>
  );
}
```

### Multi-Page Modal

```tsx
import { useState } from 'react';
import { Layout } from '@/components/layout';

export default function PageWithModal() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <button onClick={() => setShowModal(true)}>
          Open Modal
        </button>
        
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <h2>Modal Content</h2>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
```

### Dark Mode Toggle

```tsx
import { useTheme } from '@/context/theme-context';
import { Layout } from '@/components/layout';

export default function ThemeSwitchPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Layout className={theme === 'dark' ? 'dark' : 'light'}>
      <div className="container mx-auto py-8">
        <button onClick={toggleTheme}>
          Toggle Theme: {theme}
        </button>
      </div>
    </Layout>
  );
}
```

## Troubleshooting

### Navbar Overlapping Content

**Problem:** Content hidden behind navbar

**Solution:** Add padding-top to main content

```tsx
<Layout>
  <main className="pt-20">
    {/* Content will appear below navbar */}
  </main>
</Layout>
```

### Mobile Menu Not Closing

**Problem:** Mobile menu stays open after click

**Solution:** This is handled automatically, but if needed:

```tsx
// In your navigation link component
<a 
  href="/path" 
  onClick={() => {
    // Menu will close automatically
  }}
>
  Link
</a>
```

### Scroll Animation Not Smooth

**Problem:** Choppy scroll blur effect

**Solution:** Ensure performance - reduce other animations on page

```tsx
// Disable other animations when navbar blur is active
{!scrolled && <ExpensiveAnimation />}
```

### Mobile Menu Scrolls with Page

**Problem:** Mobile menu scrolls along with page content

**Solution:** Menu has `position: fixed` - ensure parent container doesn't restrict it

```tsx
// In Layout.tsx - ensure no overflow:hidden on parent
<div className="min-h-screen overflow-auto">
  {/* Navbar will still be fixed */}
</div>
```

## Migration Guide

### From Old Navbar

```tsx
// Old
import OldNavbar from './OldNavbar';

export default function Page() {
  return (
    <>
      <OldNavbar />
      <main>{children}</main>
    </>
  );
}

// New
import { Layout } from '@/components/layout';

export default function Page() {
  return (
    <Layout>
      {children}
    </Layout>
  );
}
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Guide](https://www.framer.com/motion/animation)
- [React Router Documentation](https://reactrouter.com)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)

## Support

For issues or questions:
1. Check [TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md) for detailed specs
2. Review test files for usage examples
3. Check [README.md](./README.md) for overview
4. Open an issue on GitHub

---

**Last Updated:** May 2026  
**Version:** 1.0.0
