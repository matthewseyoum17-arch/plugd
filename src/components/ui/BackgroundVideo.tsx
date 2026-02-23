'use client'

import { useEffect, useRef, memo } from 'react'
import Hls from 'hls.js'

interface BackgroundVideoProps {
  src: string
  poster?: string
  className?: string
}

export const BackgroundVideo = memo(function BackgroundVideo({ src, poster, className = '' }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error)
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error)
      })
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src])

  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <video
        ref={videoRef}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{ opacity: 1 }}
      />
      {/* Optional fade overlay to blend the bottom edge if needed, but per prompt: "100% Opacity (no dark overlays)" */}
    </div>
  )
})
