'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface WallpaperConfig {
  id: string;
  name: string;
  route: string;
  folder: string;
  src: string;
  fallbackSrc: string;
  originalFileName: string;
  description: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPosition?: string;
  scale?: number;
}

export const WALLPAPER_REGISTRY: Record<string, WallpaperConfig> = {
  '/': {
    id: 'explorer',
    name: '3D Orbiting Planets & Ring Stations',
    route: 'home',
    folder: 'API Explorer',
    src: '/live-wallpapers/bg-explorer.mp4',
    fallbackSrc: '/live-background/API%20Explorer/From%20Klickpin.com-%20Minimal%20Weekend%20Getaway%20Ideas%20for%20a%20Cozy%20Vibe%2083053-pin-id-10273905393696374.mp4',
    originalFileName: 'From Klickpin.com- Minimal Weekend Getaway Ideas for a Cozy Vibe 83053-pin-id-10273905393696374.mp4',
    description: 'Cinematic 3D planetary system with sci-fi orbital ring stations and city lights'
  },
  '/galaxy': {
    id: 'galaxy',
    name: 'Interstellar Galaxy Dashboard',
    route: 'Galaxy Dashboard',
    folder: 'Galaxy Dashboard',
    src: '/live-wallpapers/bg-galaxy.mp4',
    fallbackSrc: '/live-background/Galaxy%20Dashboard/From%20Klickpin.com-%20Classic%20Meal%20Prep%20Ideas%20to%20Refresh%20Your%20Routine-pin-id-47498971066218091.mp4',
    originalFileName: 'From Klickpin.com- Classic Meal Prep Ideas to Refresh Your Routine-pin-id-47498971066218091.mp4',
    description: 'Hyper-dimensional deep space galaxy wormhole warp with spiral nebula'
  },
  '/vault': {
    id: 'docs',
    name: 'Docs Hub Knowledge Matrix',
    route: 'API Key Vault',
    folder: 'Docs Hub',
    src: '/live-wallpapers/bg-docs.mp4',
    fallbackSrc: '/live-background/Docs%20Hub/From%20Klickpin.com-%20Romantic%20partner%20appreciation%20lines%20for%20busy%20days%20that%20fit%20modern%20everyday%20life%20for%20cozy%20hearts-pin-id-2322237303334005.mp4',
    originalFileName: 'From Klickpin.com- Romantic partner appreciation lines for busy days that fit modern everyday life for cozy hearts-pin-id-2322237303334005.mp4',
    description: 'Living OpenAPI documentation library with changelog trackers'
  },
  '/playground': {
    id: 'playground',
    name: 'Playground Telemetry Field',
    route: 'Playground',
    folder: 'Playground',
    src: '/live-wallpapers/bg-playground.mp4',
    fallbackSrc: '/live-background/Playground/From%20Klickpin.com-%20Peaceful%20quote%20collections%20with%20ideas%20people%20actually%20use%20with%20timeless%20style%20to%20revisit%20all%20week-pin-id-70579919156554076.mp4',
    originalFileName: 'From Klickpin.com- Peaceful quote collections with ideas people actually use with timeless style to revisit all week-pin-id-70579919156554076.mp4',
    description: 'Sub-second real-time request acceleration and HTTP execution environment'
  },
  '/analytics': {
    id: 'analytics',
    name: 'Electric Plasma Galaxy Metrics',
    route: 'Galaxy Metrics',
    folder: 'Galaxy Metrics',
    src: '/live-wallpapers/bg-analytics.mp4',
    fallbackSrc: '/live-background/Galaxy%20Metrics/From%20Klickpin.com-%201041879695055225352-pin-id-1041879695055225352.mp4',
    originalFileName: 'From Klickpin.com- 1041879695055225352-pin-id-1041879695055225352.mp4',
    description: 'Electric violet-white energy plasma particle continuum simulation'
  },
  '/alerts': {
    id: 'alerts',
    name: 'Smart Alerts Neural Eye',
    route: 'Smart Alerts',
    folder: 'Smart Alerts',
    src: '/live-wallpapers/bg-alerts.mp4',
    fallbackSrc: '/live-background/Smart%20Alerts/From%20Klickpin.com-%20Copy%20this%20guide%20to%20creative%20paint%20project%20ideas%20that%20feel%20luxe%20without%20spending%20a%20fortune%20with%20beginner-friendly%20tips%20and%20easy.mp4',
    originalFileName: 'From Klickpin.com- Copy this guide to creative paint project ideas that feel luxe without spending a fortune with beginner-friendly tips and easy.mp4',
    description: 'All-seeing cybernetic neural eye morphing into a solar flare alert vortex'
  },
  '/ultron': {
    id: 'recommender',
    name: 'Al Recommender Neural Matrix',
    route: 'Ultron Singularity',
    folder: 'Al Recommender',
    src: '/live-wallpapers/bg-recommender.mp4',
    fallbackSrc: '/live-background/Al%20Recommender/From%20Klickpin.com-%20Save%20this%20guide%20to%20viral%20succulent%20shelf%20ideas%20youll%20want%20to%20recreate%20this%20weekend%20with%20beginner-friendly%20tips%20and%20easy%20details.mp4',
    originalFileName: 'From Klickpin.com- Save this guide to viral succulent shelf ideas youll want to recreate this weekend with beginner-friendly tips and easy details.mp4',
    description: 'Streamed full-stack API architecture recommendations and cost forecasts'
  },
  '/explorer': {
    id: 'settings',
    name: 'Quantum Microchip RBAC Bridge',
    route: 'API Explorer',
    folder: 'Settings & RBAC',
    src: '/live-wallpapers/bg-settings.mp4',
    fallbackSrc: '/live-background/Settings%20&%20RBAC/From%20Klickpin.com-%2089%20Trending%20Air%20Fryer%20Recipes%20for%20Right%20Now-pin-id-950822540097847162.mp4',
    originalFileName: 'From Klickpin.com- 89 Trending Air Fryer Recipes for Right Now-pin-id-950822540097847162.mp4',
    description: 'Futuristic quantum microchip processor with security governance matrix'
  },
  '/docs': {
    id: 'vault',
    name: 'Liquid Mineral Vault Singularity',
    route: 'Docs Hub',
    folder: 'API Key Vault',
    src: '/live-wallpapers/bg-vault.mp4',
    fallbackSrc: '/live-background/API%20Key%20Vault/From%20Klickpin.com-%20Love%20this%20cozy%20marketing%20idea%20roundup%20that%20feel%20luxe%20without%20spending%20a%20fortune%20with%20smart%20steps%20cute%20details%20and%20cozy%20vibes%20an.mp4',
    originalFileName: 'From Klickpin.com- Love this cozy marketing idea roundup that feel luxe without spending a fortune with smart steps cute details and cozy vibes an.mp4',
    description: 'Monochromatic liquid mineral flow singularity with zero-trust cryptographic halo'
  },
  '/setup': {
    id: 'setup',
    name: 'Setup Assistant Flight Deck',
    route: 'Setup Assistant',
    folder: 'Setup Assistant',
    src: '/live-wallpapers/bg-setup.mp4',
    fallbackSrc: '/live-background/Setup%20Assistant/From%20Klickpin.com-%20Try%20Cozy%20morning%20routine%20ideas%20for%20a%20look%20that%20feels%20timeless%20but%20still%20current%20with%20simple%20details%20that%20elevate%20the%20final%20look.mp4',
    originalFileName: 'From Klickpin.com- Try Cozy morning routine ideas for a look that feels timeless but still current with simple details that elevate the final look.mp4',
    description: 'Step-by-step launch checklist with live endpoint ping verification'
  },
  '/free-tier': {
    id: 'free-tier',
    name: 'Free Tier Fuel Radar',
    route: 'Free Tier Finder',
    folder: 'Free Tier Finder',
    src: '/live-wallpapers/bg-freetier.mp4',
    fallbackSrc: '/live-background/Free%20Tier%20Finder/From%20Klickpin.com-%20Romantic%20sweet%20text%20ideas%20for%20people%20who%20love%20practical%20beauty%20with%20timeless%20style%20to%20send%20tonight-pin-id-1142436630479912578.mp4',
    originalFileName: 'From Klickpin.com- Romantic sweet text ideas for people who love practical beauty with timeless style to send tonight-pin-id-1142436630479912578.mp4',
    description: 'Real-time free tier limits, no-card filters, and fuel tank gauges'
  },
  '/recommender': {
    id: 'ultron',
    name: 'Ultron Matrix Singularity Skull',
    route: 'Al Recommender',
    folder: 'Ultron Singularity',
    src: '/live-wallpapers/bg-ultron.mp4',
    fallbackSrc: '/live-background/Ultron%20Singularity/From%20Klickpin.com-%2080%20Digital%20Detox%20Ideas%20for%20Budget%20Living-pin-id-1058486718679817913.mp4',
    originalFileName: 'From Klickpin.com- 80 Digital Detox Ideas for Budget Living-pin-id-1058486718679817913.mp4',
    description: 'Cybernetic matrix binary hacker skull with hardware encryption code rain',
    objectFit: 'cover',
    objectPosition: 'center center',
    scale: 1.0
  },
  '/starter-kits': {
    id: 'starter-kits',
    name: 'Starter Kits Singularity Cloud',
    route: 'Starter Kits',
    folder: 'Starter Kits',
    src: '/live-wallpapers/bg-starterkits.mp4',
    fallbackSrc: '/live-background/Starter%20Kits/From%20Klickpin.com-%20Beautiful%20travel%20bucket%20list%20ideas%20that%20are%20perfect%20when%20you%20want%20something%20stylish%20modern%20and%20easy%20to%20copy%20for%20creators%20who%20lo.mp4',
    originalFileName: 'From Klickpin.com- Beautiful travel bucket list ideas that are perfect when you want something stylish modern and easy to copy for creators who lo.mp4',
    description: 'Quantum light bubble singularity stardust cloud with instant zip scaffolding'
  },
  '/community': {
    id: 'community',
    name: 'Community Colony Hub',
    route: 'Community',
    folder: 'Community',
    src: '/live-wallpapers/bg-community.mp4',
    fallbackSrc: '/live-background/Community/From%20Klickpin.com-%20Polished%20summer%20outfit%20inspiration%20that%20look%20expensive%20while%20staying%20practical%20realistic%20and%20beginner%20friendly%20for%20anyone%20who%20w.mp4',
    originalFileName: 'From Klickpin.com- Polished summer outfit inspiration that look expensive while staying practical realistic and beginner friendly for anyone who w.mp4',
    description: 'Collaborative astronaut developer network, reviews and shared kits'
  },
  '/learning': {
    id: 'learning',
    name: 'Mission Map Deep Space Flight',
    route: 'Mission Map',
    folder: 'Galaxy Dashboard',
    src: '/live-wallpapers/bg-learning.mp4',
    fallbackSrc: '/live-background/Galaxy%20Dashboard/From%20Klickpin.com-%20Classic%20Meal%20Prep%20Ideas%20to%20Refresh%20Your%20Routine-pin-id-47498971066218091.mp4',
    originalFileName: 'From Klickpin.com- Classic Meal Prep Ideas to Refresh Your Routine-pin-id-47498971066218091.mp4',
    description: 'Interactive API mastery flight paths and sandbox flight simulators'
  },
  '/settings': {
    id: 'home',
    name: 'Home Genesis Continuum',
    route: 'Settings & RBAC',
    folder: 'home',
    src: '/live-wallpapers/bg-home.mp4',
    fallbackSrc: '/live-background/home/From%20Klickpin.com-%20Smart%20daily%20stitch%20inspiration%20with%20timeless%20style%20for%20practical%20creative%20living-pin-id-674695587922135451.mp4',
    originalFileName: 'From Klickpin.com- Smart daily stitch inspiration with timeless style for practical creative living-pin-id-674695587922135451.mp4',
    description: 'High-definition cosmic radiance continuum for Developer OS entry'
  }
};

// Array of all feature wallpapers in sequence for continuous looping on home page
export const ALL_WALLPAPERS: WallpaperConfig[] = Object.values(WALLPAPER_REGISTRY);

interface WallpaperContextType {
  activeWallpaper: WallpaperConfig;
  setActiveWallpaper: (wp: WallpaperConfig) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  opacityMode: 'vivid' | 'balanced' | 'stealth';
  setOpacityMode: (mode: 'vivid' | 'balanced' | 'stealth') => void;
  quality: '4k' | '1080p' | 'eco';
  setQuality: (quality: '4k' | '1080p' | 'eco') => void;
  volume: number;
  setVolume: (vol: number) => void;
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined);

export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperConfig>(
    WALLPAPER_REGISTRY[pathname] || WALLPAPER_REGISTRY['/']
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [quality, setQuality] = useState<'4k' | '1080p' | 'eco'>('4k');
  const [opacityMode, setOpacityMode] = useState<'vivid' | 'balanced' | 'stealth'>('vivid');

  // When pathname changes, set active wallpaper directly to the route's background
  useEffect(() => {
    if (WALLPAPER_REGISTRY[pathname]) {
      setActiveWallpaper(WALLPAPER_REGISTRY[pathname]);
    } else {
      setActiveWallpaper(WALLPAPER_REGISTRY['/']);
    }
  }, [pathname]);

  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleMute = () => setIsMuted((m) => !m);

  return (
    <WallpaperContext.Provider
      value={{
        activeWallpaper,
        setActiveWallpaper,
        isPlaying,
        togglePlay,
        isMuted,
        toggleMute,
        volume,
        setVolume,
        quality,
        setQuality,
        opacityMode,
        setOpacityMode
      }}
    >
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const ctx = useContext(WallpaperContext);
  if (!ctx) {
    throw new Error('useWallpaper must be used within WallpaperProvider');
  }
  return ctx;
};
