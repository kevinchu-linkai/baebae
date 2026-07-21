import { useEffect, useRef } from 'react'

const COUNT = 44
const COLORS = ['255,210,140', '255,180,200', '255,150,90']

function rand(min, max) {
  return min + Math.random() * (max - min)
}

export function Fireflies({ active }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const flies = Array.from({ length: COUNT }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      vx: rand(-8, 8),
      vy: rand(-6, 6),
      size: rand(1.5, 3.2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: rand(0, Math.PI * 2),
      speed: rand(0.6, 1.6),
    }))

    let last = performance.now()
    let frameId

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = now / 1000
      const w = window.innerWidth
      const h = window.innerHeight

      ctx.clearRect(0, 0, w, h)

      const targetOpacity = activeRef.current ? 1 : 0
      canvas.style.opacity = String(
        Number(canvas.style.opacity || 0) + (targetOpacity - Number(canvas.style.opacity || 0)) * 0.02,
      )

      if (Number(canvas.style.opacity || 0) > 0.01) {
        for (const f of flies) {
          f.vx += Math.sin(t * f.speed + f.phase) * 4 * dt
          f.vy += Math.cos(t * f.speed * 0.8 + f.phase) * 4 * dt
          f.vx *= 0.985
          f.vy *= 0.985
          f.x += f.vx * dt
          f.y += f.vy * dt

          if (f.x < -10) f.x = w + 10
          if (f.x > w + 10) f.x = -10
          if (f.y < -10) f.y = h + 10
          if (f.y > h + 10) f.y = -10

          const twinkle = 0.4 + Math.sin(t * 2.2 + f.phase) * 0.35 + 0.25
          const r = f.size * (2.4 + Math.sin(t * 2.2 + f.phase) * 0.6)

          const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 4)
          grad.addColorStop(0, `rgba(${f.color},${twinkle})`)
          grad.addColorStop(1, `rgba(${f.color},0)`)
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(f.x, f.y, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-[1] pointer-events-none" style={{ opacity: 0 }} />
  )
}
