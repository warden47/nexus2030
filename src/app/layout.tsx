// app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';
import ZustandHydration from '@/components/providers/ZustandHydration';
import ToastContainer from '@/components/ui/ToastContainer';
import '@/styles/globals.css';
import '@/styles/animations.css';

// ── Fonts ──────────────────────────────────────────────
const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});
const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
});

// ── Metadata ───────────────────────────────────────────
export const metadata: Metadata = {
  title: 'NEXUS 2030',
  description: 'The future of streaming',
  themeColor: '#03050A',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="bg-[#03050A] text-white antialiased min-h-screen">
        <QueryProvider>
          <AuthProvider>
            <ZustandHydration>
              {children}
              <ToastContainer />
            </ZustandHydration>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}