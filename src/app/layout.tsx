import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "TimeFlow Pro",
  description: "Advanced time tracking for the modern era",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TimeFlow Pro",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

// Script to apply theme immediately to avoid flash
const themeScript = `
  (function() {
    function getTheme() {
      const stored = localStorage.getItem('timeflow-theme');
      if (stored === 'light') return 'light';
      if (stored === 'dark' || !stored) return 'dark';
      if (stored === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    const theme = getTheme();
    document.documentElement.classList.add(theme);
    if (theme === 'light') {
      document.documentElement.style.backgroundColor = '#f8fafc';
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.backgroundColor = '#0f0a1a';
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${jakarta.variable} ${jetbrains.variable} antialiased bg-background text-slate-200 overflow-hidden h-screen`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
