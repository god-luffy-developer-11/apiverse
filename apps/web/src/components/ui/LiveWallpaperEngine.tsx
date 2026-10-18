'use client';

import React, { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallpaper, ALL_WALLPAPERS } from '@/context/WallpaperContext';

export const LiveWallpaperEngine: React.FC = () => {
  const pathname = usePathname();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    activeWallpaper,
    isPlaying,
    isMuted,
    volume,
    quality,
    opacityMode
  } = useWallpaper();

  // Control play/pause, volume, and playback rate (normal 1.0x speed)
  useEffect(() => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = 1.0;
    videoRef.current.volume = volume;
    videoRef.current.muted = isMuted;

    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isMuted, volume, activeWallpaper.src, pathname]);

  // Handle video completion: seamlessly loop current background
  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Video post-processing filter depending on selected quality (ultra-enhanced clarity & sharpness)
  const getQualityFilter = () => {
    switch (quality) {
      case '4k':
        return 'contrast(115%) brightness(108%) saturate(112%)';
      case '1080p':
        return 'contrast(108%) brightness(105%) saturate(106%)';
      case 'eco':
        return 'contrast(102%) brightness(101%) saturate(100%)';
      default:
        return 'contrast(115%) brightness(108%) saturate(112%)';
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
      <video
        key={activeWallpaper.src}
        ref={videoRef}
        autoPlay
        loop
        playsInline
        preload="auto"
        muted={isMuted}
        onLoadedMetadata={(e) => {
          const vid = e.currentTarget;
          vid.playbackRate = 1.0;
          vid.volume = volume;
          vid.muted = isMuted;
        }}
        onEnded={handleVideoEnded}
        className="w-full h-full min-w-full min-h-full transition-all duration-700"
        style={{
          objectFit: activeWallpaper.objectFit || 'cover',
          objectPosition: activeWallpaper.objectPosition || 'center center',
          filter: getQualityFilter(),
          transform: activeWallpaper.scale ? `scale(${activeWallpaper.scale}) translateZ(0)` : 'translateZ(0)',
          backfaceVisibility: 'hidden',
          imageRendering: 'high-quality' as any
        }}
      >
        <source src={activeWallpaper.src} type="video/mp4" />
        <source src={activeWallpaper.fallbackSrc} type="video/mp4" />
      </video>

      {/* Crystal-Clear Ultra-Low Attenuation Shading Overlay for Maximum Video Vibrancy */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          opacityMode === 'vivid'
            ? 'bg-black/10'
            : opacityMode === 'balanced'
            ? 'bg-black/25'
            : 'bg-black/45'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.45)_100%]" />
    </div>
  );
};
