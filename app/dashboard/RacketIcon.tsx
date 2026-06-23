'use client'

import { useRef, useEffect } from 'react'

interface RacketIconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function RacketIcon({ size = 32, className, style }: RacketIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new window.Image()
    img.src = '/paleta.png'
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // Remove neutral white/gray checkerboard pixels (R≈G≈B and bright)
        const isNeutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20
        if (isNeutral && r > 190) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ height: `${size}px`, width: 'auto', display: 'inline-block', ...style }}
    />
  )
}
