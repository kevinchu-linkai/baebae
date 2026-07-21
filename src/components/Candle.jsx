import { useRef, useEffect } from 'react'

function rand(min, max) {
  return min + Math.random() * (max - min)
}

// Fire color ramp: white-hot core -> yellow -> orange -> red -> smoke-grey,
// walked by each particle's life fraction (1 = just spawned, 0 = dead).
function fireColor(t) {
  if (t > 0.75) return [255, 244, 214]
  if (t > 0.5) return [255, 197, 92]
  if (t > 0.25) return [255, 120, 40]
  return [180, 40, 20]
}

class Particle {
  constructor(x, y, opts) {
    this.x = x
    this.y = y
    this.vx = opts.vx
    this.vy = opts.vy
    this.life = opts.life
    this.maxLife = opts.life
    this.size = opts.size
    this.smoke = !!opts.smoke
    this.seed = Math.random() * 1000
  }

  step(dt, t) {
    if (this.smoke) {
      this.vy -= 22 * dt // gentle buoyancy
      this.vx += Math.sin(t * 1.3 + this.seed) * 10 * dt
      this.vx *= 0.99
      this.vy *= 0.99
    } else {
      this.vy -= 95 * dt // stronger buoyancy for flame
      this.vx += Math.sin(t * 5 + this.seed) * 26 * dt // flicker turbulence
      this.vx *= 0.94
      this.vy *= 0.97
    }
    this.x += this.vx * dt
    this.y += this.vy * dt
    this.life -= dt
    return this.life > 0
  }

  draw(ctx) {
    const t = Math.max(0, this.life / this.maxLife)
    const size = this.smoke ? this.size * (1.4 - t * 0.4) : this.size * (0.4 + t * 0.6)
    if (size <= 0.1) return

    ctx.save()
    if (this.smoke) {
      ctx.globalCompositeOperation = 'source-over'
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size)
      grad.addColorStop(0, `rgba(210,205,200,${0.35 * t})`)
      grad.addColorStop(1, 'rgba(210,205,200,0)')
      ctx.fillStyle = grad
    } else {
      ctx.globalCompositeOperation = 'lighter'
      const [r, g, b] = fireColor(t)
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size)
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.9 * t})`)
      grad.addColorStop(0.6, `rgba(${r},${g},${b},${0.45 * t})`)
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
      ctx.fillStyle = grad
    }
    ctx.beginPath()
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// `scale` shrinks the whole candle (canvas + particle sizes + wax stick)
// proportionally so a large candleCount still fits — physics constants stay
// in the same units, just walked at a smaller pixel footprint.
export function Candle({ blown, onBlow, index, scale = 1 }) {
  const canvasRef = useRef(null)
  const blownRef = useRef(blown)
  const burstDoneRef = useRef(false)

  const canvasW = 56 * scale
  const canvasH = 92 * scale
  const wickX = canvasW / 2
  const wickY = canvasH - 30 * scale

  useEffect(() => {
    blownRef.current = blown
    if (!blown) burstDoneRef.current = false
  }, [blown])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = canvasW * dpr
    canvas.height = canvasH * dpr
    canvas.style.width = `${canvasW}px`
    canvas.style.height = `${canvasH}px`
    ctx.scale(dpr, dpr)

    let particles = []
    let spawnAccumulator = 0
    let last = performance.now()
    let frameId

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = now / 1000

      ctx.clearRect(0, 0, canvasW, canvasH)

      const isBlown = blownRef.current

      if (!isBlown) {
        spawnAccumulator += dt
        while (spawnAccumulator > 0.012) {
          spawnAccumulator -= 0.012
          particles.push(
            new Particle(wickX + rand(-1.5, 1.5) * scale, wickY, {
              vx: rand(-6, 6) * scale,
              vy: rand(-55, -75) * scale,
              life: rand(0.45, 0.75),
              size: rand(6, 10) * scale,
            }),
          )
        }

        // Warm glow behind the flame — the "lighting" cast by the fire.
        const flicker = 0.75 + Math.sin(t * 9) * 0.08 + Math.sin(t * 23) * 0.05
        const glowR = 34 * scale * flicker
        const glowGrad = ctx.createRadialGradient(
          wickX, wickY - 14 * scale, 0,
          wickX, wickY - 14 * scale, glowR,
        )
        glowGrad.addColorStop(0, `rgba(255,180,90,${0.5 * flicker})`)
        glowGrad.addColorStop(1, 'rgba(255,140,60,0)')
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(wickX, wickY - 14 * scale, glowR, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        canvas.style.filter = `drop-shadow(0 0 ${10 * scale * flicker}px rgba(255,150,70,0.8))`
      } else if (!burstDoneRef.current) {
        burstDoneRef.current = true
        for (let i = 0; i < 16; i++) {
          const angle = -Math.PI / 2 + rand(-0.9, 0.9)
          const speed = rand(24, 60) * scale
          particles.push(
            new Particle(wickX, wickY - 6 * scale, {
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: rand(0.9, 1.4),
              size: rand(5, 9) * scale,
              smoke: true,
            }),
          )
        }
        canvas.style.filter = 'none'
      }

      particles = particles.filter((p) => p.step(dt, t))
      for (const p of particles) p.draw(ctx)

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale])

  return (
    <button
      type="button"
      onClick={onBlow}
      disabled={blown}
      className="relative flex flex-col items-center"
      aria-label={`第 ${index + 1} 根蠟燭`}
    >
      <canvas ref={canvasRef} className="pointer-events-none" />
      <div
        className="rounded-sm"
        style={{
          marginTop: -24 * scale,
          width: 12 * scale,
          height: 40 * scale,
          background: 'linear-gradient(180deg, hsl(var(--color-primary)) 0%, hsl(var(--color-primary-hover)) 100%)',
        }}
      />
    </button>
  )
}
