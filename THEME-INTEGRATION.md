# Theme & PWA Integration Guide

This document explains how to integrate the PWA manifest and theme toggle into your TimeFlow Pro application.

## 1. Update Root Layout (`src/app/layout.tsx`)

Add the following to the `<head>` section:

```tsx
// In your RootLayout component, add these meta tags and link:

<head>
  {/* PWA Manifest */}
  <link rel="manifest" href="/manifest.json" />

  {/* Theme Color - will be updated dynamically by useTheme */}
  <meta name="theme-color" content="#0f0a1a" />

  {/* Apple Touch Icon for iOS */}
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />

  {/* Mobile Web App capable */}
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</head>
```

## 2. Update HTML Element Classes

Modify the `<html>` tag to support theme classes:

```tsx
// Before
<html lang="en">

// After
<html lang="en" className="dark" suppressHydrationWarning>
```

The `suppressHydrationWarning` prevents React warnings when the class changes on mount.

## 3. Add Theme Toggle to Header

Import and use the ThemeToggle component in your header/navigation:

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

// In your header component, add:
<ThemeToggle />
```

Example integration in a header:

```tsx
<header className="flex items-center justify-between p-4">
  <Logo />
  <nav className="flex items-center gap-4">
    <ThemeToggle />
    <UserMenu />
  </nav>
</header>
```

## 4. Update Tailwind CSS for Theme Support

Ensure your `tailwind.config.ts` has dark mode configured:

```ts
module.exports = {
  darkMode: 'class',
  // ... rest of config
}
```

## 5. Update Global Styles

In your global CSS file (`src/app/globals.css`), add theme-aware styles:

```css
/* Base theme variables */
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

.dark {
  --background: #0f0a1a;
  --foreground: #f8fafc;
}

/* Apply theme to body */
body {
  background-color: var(--background);
  color: var(--foreground);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

## 6. Theme Color Reference

| Theme | Background | Primary |
|-------|------------|---------|
| Dark  | `#0f0a1a`  | `#8b5cf6` |
| Light | `#f8fafc` (slate-50) | `#8b5cf6` |

## 7. Using Theme in Components

To access the current theme in any component:

```tsx
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className={resolvedTheme === 'dark' ? 'bg-[#0f0a1a]' : 'bg-slate-50'}>
      Current theme: {resolvedTheme}
    </div>
  );
}
```

## 8. PWA Testing

To test PWA functionality:

1. Build your app: `npm run build`
2. Serve it: `npm start`
3. Open Chrome DevTools > Application > Manifest
4. Verify the manifest is loaded correctly
5. Test "Add to Home Screen" on mobile devices

## Files Created in This Session

- `public/manifest.json` - PWA manifest
- `public/icons/icon-192.png` - 192x192 app icon
- `public/icons/icon-512.png` - 512x512 app icon
- `src/hooks/useTheme.ts` - Theme management hook
- `src/components/ui/theme-toggle.tsx` - Theme toggle button component
