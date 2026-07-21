import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser'

const DEFAULT_COLOR = '#ec4899' // rose — matches --color-primary

const NOISE_GLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`

const CORE_VERTEX_SHADER = `
  uniform float time;
  uniform float audioLevel;
  varying vec3 vNormal;
  varying vec3 vPosition;
  ${NOISE_GLSL}
  void main() {
      vNormal = normal;
      vPosition = position;
      float displacement = snoise(position * 2.0 + time * 0.5) * 0.2 * (1.0 + audioLevel * 1.6);
      vec3 newPosition = position + normal * displacement;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const CORE_FRAGMENT_SHADER = `
  uniform vec3 color;
  uniform vec3 pointLightPos;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(pointLightPos - vPosition);
      float diffuse = max(dot(normal, lightDir), 0.0);
      float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
      fresnel = pow(fresnel, 2.0);
      vec3 finalColor = color * diffuse + color * fresnel * 0.5;
      gl_FragColor = vec4(finalColor, 1.0);
  }
`

// A soft, semi-transparent fill nested just inside the wireframe heart shell.
// Adds a Blinn-Phong specular glint (tinted near-white, like polished metal)
// on top of the same warm color/fresnel glow — a "minor touch" of metallic
// sheen rather than a full PBR material.
const HEART_FILL_FRAGMENT_SHADER = `
  uniform vec3 color;
  uniform vec3 pointLightPos;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(pointLightPos - vPosition);
      vec3 viewDir = normalize(cameraPosition - vPosition);
      vec3 halfDir = normalize(lightDir + viewDir);

      float diffuse = max(dot(normal, lightDir), 0.0);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
      float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);

      vec3 base = color * (0.3 + diffuse * 0.45);
      vec3 metallic = vec3(1.0, 0.98, 0.94) * spec * 0.65;
      vec3 sheen = vec3(0.85, 0.85, 0.95) * fresnel * 0.22;

      gl_FragColor = vec4(base + metallic + sheen, 0.45);
  }
`

const PARTICLE_VERTEX_SHADER = `
  uniform float time;
  uniform float bands[8];
  attribute float aBand;
  attribute float aSeed;
  varying float vAmp;
  void main() {
      int band = int(aBand);
      float amp = bands[band];
      vAmp = amp;
      float wobble = sin(time * 0.6 + aSeed * 6.2831853) * 0.06;
      vec3 pos = position * (1.0 + amp * 0.55 + wobble);
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (2.0 + amp * 7.0) * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
  }
`

const PARTICLE_FRAGMENT_SHADER = `
  uniform vec3 color;
  varying float vAmp;
  void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float alpha = smoothstep(0.5, 0.0, d) * (0.25 + vAmp * 0.75);
      gl_FragColor = vec4(color, alpha);
  }
`

// Classic parametric heart curve (x = 16sin³t, y = 13cos t − 5cos2t − 2cos3t
// − cos4t), sampled densely and extruded with a bevel for real 3D depth
// instead of a flat cutout.
function createHeartGeometry() {
  const shape = new THREE.Shape()
  const steps = 120
  const scale = 1 / 15

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3) * scale
    const y =
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.14,
    bevelSegments: 8,
    curveSegments: 12,
  })
  geometry.center()
  geometry.computeVertexNormals()
  return geometry
}

function buildParticleField(count) {
  const positions = new Float32Array(count * 3)
  const bands = new Float32Array(count)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const radius = 1.9 + Math.random() * 1.4
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
    bands[i] = Math.floor(Math.random() * 8)
    seeds[i] = Math.random()
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aBand', new THREE.BufferAttribute(bands, 1))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  return geometry
}

// Persistent full-viewport WebGL background: a glowing wireframe core plus a
// reactive particle halo, both driven by real-time audio analysis and by
// `loveColor`, which the page smoothly lerps toward whenever a love-word cue
// fires during playback.
export function AmbientScene({ audioRef, loveColor }) {
  const mountRef = useRef(null)
  const sceneApiRef = useRef(null)
  const { bandsRef, levelRef } = useAudioAnalyser(audioRef)

  useEffect(() => {
    const currentMount = mountRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 3.4

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    const currentColor = new THREE.Color(loveColor || DEFAULT_COLOR)
    const targetColor = new THREE.Color(loveColor || DEFAULT_COLOR)

    const coreGeometry = createHeartGeometry()
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: currentColor.clone() },
      },
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: CORE_FRAGMENT_SHADER,
      wireframe: true,
    })
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial)
    scene.add(coreMesh)

    // Nested solid fill — same heart, slightly smaller, carrying the metallic
    // specular sheen — sitting inside the wireframe shell.
    const fillMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: currentColor.clone() },
      },
      vertexShader: CORE_VERTEX_SHADER,
      fragmentShader: HEART_FILL_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    })
    const fillMesh = new THREE.Mesh(coreGeometry, fillMaterial)
    fillMesh.scale.setScalar(0.96)
    scene.add(fillMesh)

    const particleGeometry = buildParticleField(2400)
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        bands: { value: new Array(8).fill(0) },
        color: { value: currentColor.clone() },
      },
      vertexShader: PARTICLE_VERTEX_SHADER,
      fragmentShader: PARTICLE_FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)

    let frameId
    const animate = (t) => {
      const time = t * 0.0003
      coreMaterial.uniforms.time.value = time
      fillMaterial.uniforms.time.value = time
      particleMaterial.uniforms.time.value = time
      coreMaterial.uniforms.audioLevel.value = levelRef.current
      fillMaterial.uniforms.audioLevel.value = levelRef.current
      particleMaterial.uniforms.bands.value = Array.from(bandsRef.current)

      currentColor.lerp(targetColor, 0.02)
      coreMaterial.uniforms.color.value.copy(currentColor)
      fillMaterial.uniforms.color.value.copy(currentColor)
      particleMaterial.uniforms.color.value.copy(currentColor)

      coreMesh.rotation.y += 0.0006 + levelRef.current * 0.002
      coreMesh.rotation.x += 0.0003
      fillMesh.rotation.copy(coreMesh.rotation)
      particles.rotation.y -= 0.00015

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    animate(0)

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    }

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const dist = -camera.position.z / dir.z
      const pos = camera.position.clone().add(dir.multiplyScalar(dist))
      coreMaterial.uniforms.pointLightPos.value.copy(pos)
      fillMaterial.uniforms.pointLightPos.value.copy(pos)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    sceneApiRef.current = { setTargetColor: (hex) => targetColor.set(hex) }

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      currentMount.removeChild(renderer.domElement)
      coreGeometry.dispose()
      coreMaterial.dispose()
      fillMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      renderer.dispose()
      sceneApiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    sceneApiRef.current?.setTargetColor(loveColor || DEFAULT_COLOR)
  }, [loveColor])

  return <div ref={mountRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />
}
