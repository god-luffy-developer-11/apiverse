import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'APIVERSE | The Developer Operating System for APIs',
  description: 'Commercial-grade, multi-tenant cosmic API operating system with real-time analytics, AES-256-GCM vault, Ultron AI, and 3D galaxy visualization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#000000] text-white antialiased min-h-screen selection:bg-white/10 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
