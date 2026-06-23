'use client'

import { useRef, useEffect } from 'react'

export default function RacketHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isHovered = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Load image and remove near-white/checkerboard background via canvas
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
        // Remove white/gray checkerboard: high R, G, B all similar
        // Preserve cream/yellow (high R+G, low B) and dark racket parts
        const isNeutral = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20
        if (isNeutral && r > 190) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const dx = ((e.clientX - cx) / cx) * 12
      const dy = ((e.clientY - cy) / cy) * 12
      if (isHovered.current) {
        canvas.style.animation = 'none'
        canvas.style.transform = `perspective(600px) rotateX(${-dy}deg) rotateY(${dx}deg)`
      }
    }

    function onMouseOver() {
      isHovered.current = true
      if (canvas) canvas.style.transition = 'transform 0.1s ease-out'
    }

    function onMouseOut() {
      isHovered.current = false
      if (canvas) {
        canvas.style.animation = ''
        canvas.style.transform = ''
        canvas.style.transition = 'transform 0.4s ease-out'
      }
    }

    canvas.addEventListener('mouseover', onMouseOver)
    canvas.addEventListener('mouseout', onMouseOut)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('mouseover', onMouseOver)
      canvas.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <div
      className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block select-none"
      style={{ zIndex: 10 }}
    >
      <canvas
        ref={canvasRef}
        className="racket-float"
        style={{
          height: '420px',
          width: 'auto',
          cursor: 'grab',
          filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.4))',
          transformOrigin: 'center center',
          userSelect: 'none',
        } as React.CSSProperties}
      />
    </div>
  )
}