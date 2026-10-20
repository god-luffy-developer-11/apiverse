'use client';

import React, { useState } from 'react';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import { RealSpaceParticles } from '@/components/3d/RealSpaceParticles';
import { LiveWallpaperEngine } from '@/components/ui/LiveWallpaperEngine';
import { Header } from '@/components/navigation/Header';
import { Sidebar } from '@/components/navigation/Sidebar';
import { WarpPalette } from '@/components/navigation/WarpPalette';
import { UltronAssistantDrawer } from '@/components/ultron/UltronAssistantDrawer';
import { WallpaperProvider } from '@/context/WallpaperContext';
import { ThemeProvider } from '@/context/ThemeContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [warpOpen, setWarpOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <div className="text-white font-sans min-h-screen flex flex-col selection:bg-white/10 selection:text-white relative overflow-x-hidden bg-transparent">
          {/* 1. Global Live Wallpaper Engine (Powered by all 16 files in C:\Users\surya\Downloads\apiverse\UIUX\New folder) */}
          <LiveWallpaperEngine />

          {/* 2. Real Cosmic Space Particles Over Live Wallpaper */}
          <RealSpaceParticles />

          {/* 3. Reactive Stardust Magnetic Cursor */}
          <CustomCursor />

          {/* 4. Mineralistic Liquid Glass Header (Floating Fixed Glass Ribbon) */}
          <Header
            onOpenWarp={() => setWarpOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <WarpPalette open={warpOpen} onOpenChange={setWarpOpen} />
          
          {/* 5. Main Full-Height Workspace (Sidebar spans full viewport height from top-0 to bottom-0) */}
          <div className="flex-1 flex h-screen overflow-hidden relative z-10">
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <main className="flex-1 overflow-y-auto relative p-4 sm:p-6 lg:p-8 pt-16 bg-transparent transition-all duration-300">
              {children}
            </main>
          </div>

          {/* 6. Ultron AI Singularity Assistant Drawer */}
          <UltronAssistantDrawer />
        </div>
      </WallpaperProvider>
    </ThemeProvider>
  );
}
