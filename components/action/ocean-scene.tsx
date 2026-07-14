'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/**
 * Cinematic procedural underwater world.
 * pollution: 0 (pristine) → 1 (heavily polluted) drives water color, light,
 * caustics, particle density, fish population, and coral vitality.
 * Every asset is generated in code — no external models or textures.
 */
type SceneProps = {
  pollution: number
  reduced: boolean
}

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const CLEAN_BG = new THREE.Color('#05263c')
const DIRTY_BG = new THREE.Color('#141d1c')
const CLEAN_FOG = new THREE.Color('#0b5583')
const DIRTY_FOG = new THREE.Color('#2a3833')
const CORAL_DEAD = new THREE.Color('#5c6468')

const FLOOR_Y = -3.4

/* ------------------------------------------------------------------ */
/* Deterministic helpers                                               */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Gentle dune noise for the seabed; world-space, deterministic. */
function terrainHeight(x: number, z: number) {
  return (
    0.55 * Math.sin(x * 0.18 + 1.3) * Math.cos(z * 0.22) +
    0.3 * Math.sin(x * 0.43 + z * 0.31) +
    0.18 * Math.sin(x * 0.9 + 2.2) * Math.sin(z * 0.7)
  )
}

function floorY(x: number, z: number) {
  return FLOOR_Y + terrainHeight(x, z)
}

function makeCanvas(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  draw(ctx, w, h)
  return canvas
}

const shortestAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/* ------------------------------------------------------------------ */
/* Water, backdrop, surface, light                                     */
/* ------------------------------------------------------------------ */

function Water({ pollution }: { pollution: number }) {
  const bg = useRef<THREE.Color>(null)
  const fogRef = useRef<THREE.Fog>(null)

  useFrame(() => {
    if (bg.current) {
      bg.current.lerp(CLEAN_BG.clone().lerp(DIRTY_BG, pollution), 0.035)
    }
    const fog = fogRef.current
    if (fog) {
      fog.color.lerp(CLEAN_FOG.clone().lerp(DIRTY_FOG, pollution), 0.035)
      fog.far = THREE.MathUtils.lerp(fog.far, 30 - pollution * 15, 0.035)
    }
  })

  return (
    <>
      <color ref={bg} attach="background" args={['#05263c']} />
      <fog ref={fogRef} attach="fog" args={['#0b5583', 7, 30]} />
    </>
  )
}

/** Vertical depth-gradient backdrop; clean and murky versions crossfade. */
function Backdrop({ pollution }: { pollution: number }) {
  const cleanMat = useRef<THREE.MeshBasicMaterial>(null)
  const dirtyMat = useRef<THREE.MeshBasicMaterial>(null)

  const [cleanCanvas, dirtyCanvas] = useMemo(() => {
    const paint = (stops: [number, string][]) =>
      makeCanvas(64, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h)
        for (const [p, c] of stops) g.addColorStop(p, c)
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      })
    return [
      paint([
        [0, '#67e8f9'],
        [0.18, '#38bdf8'],
        [0.42, '#0ea5e9'],
        [0.66, '#0369a1'],
        [0.86, '#082f49'],
        [1, '#020617'],
      ]),
      paint([
        [0, '#5d6e60'],
        [0.35, '#3c4a41'],
        [0.7, '#242f2a'],
        [1, '#0d1412'],
      ]),
    ]
  }, [])

  useFrame(() => {
    if (cleanMat.current) {
      cleanMat.current.opacity = THREE.MathUtils.lerp(
        cleanMat.current.opacity,
        1 - pollution,
        0.04,
      )
    }
    if (dirtyMat.current) {
      dirtyMat.current.opacity = THREE.MathUtils.lerp(
        dirtyMat.current.opacity,
        pollution,
        0.04,
      )
    }
  })

  return (
    <group position={[0, 3, -26]}>
      <mesh>
        <planeGeometry args={[110, 60]} />
        <meshBasicMaterial ref={dirtyMat} transparent opacity={0} fog={false} depthWrite={false}>
          <canvasTexture attach="map" args={[dirtyCanvas]} colorSpace={THREE.SRGBColorSpace} />
        </meshBasicMaterial>
      </mesh>
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[110, 60]} />
        <meshBasicMaterial ref={cleanMat} transparent opacity={1} fog={false} depthWrite={false}>
          <canvasTexture attach="map" args={[cleanCanvas]} colorSpace={THREE.SRGBColorSpace} />
        </meshBasicMaterial>
      </mesh>
    </group>
  )
}

/** The undulating surface seen from below, plus a soft sun disc. */
function WaterSurface({ pollution, reduced }: SceneProps) {
  const tex = useRef<THREE.CanvasTexture>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const sunMat = useRef<THREE.SpriteMaterial>(null)

  const [rippleCanvas, sunCanvas] = useMemo(() => {
    const rand = mulberry32(808)
    const ripple = makeCanvas(256, 256, (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < 60; i++) {
        const x = rand() * w
        const y = rand() * h
        const r = 8 + rand() * 26
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, `rgba(255,255,255,${0.10 + rand() * 0.16})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.ellipse(x, y, r * (0.7 + rand() * 0.8), r * 0.5, rand() * 3, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    const sun = makeCanvas(128, 128, (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
      g.addColorStop(0, 'rgba(255,255,240,0.9)')
      g.addColorStop(0.3, 'rgba(190,235,250,0.45)')
      g.addColorStop(1, 'rgba(190,235,250,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    })
    return [ripple, sun]
  }, [])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    if (tex.current) {
      tex.current.offset.set(t * 0.008, t * 0.005)
    }
    if (mat.current) {
      mat.current.opacity = THREE.MathUtils.lerp(
        mat.current.opacity,
        0.5 * (1 - pollution * 0.75),
        0.04,
      )
    }
    if (sunMat.current) {
      sunMat.current.opacity = THREE.MathUtils.lerp(
        sunMat.current.opacity,
        0.65 * (1 - pollution * 0.85),
        0.04,
      )
    }
  })

  return (
    <>
      <mesh position={[0, 6.4, -6]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 60]} />
        <meshBasicMaterial
          ref={mat}
          color="#67e8f9"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        >
          <canvasTexture
            attach="map"
            args={[rippleCanvas]}
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
            repeat={new THREE.Vector2(5, 3)}
            ref={tex}
          />
        </meshBasicMaterial>
      </mesh>
      <sprite position={[3.5, 6.2, -11]} scale={[13, 13, 1]}>
        <spriteMaterial ref={sunMat} transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending}>
          <canvasTexture attach="map" args={[sunCanvas]} colorSpace={THREE.SRGBColorSpace} />
        </spriteMaterial>
      </sprite>
    </>
  )
}

/** Volumetric-style god rays: additive gradient blades that sway and pulse. */
function GodRays({ pollution, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null)

  const rayCanvas = useMemo(
    () =>
      makeCanvas(64, 256, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h)
        g.addColorStop(0, 'rgba(220,245,255,0.85)')
        g.addColorStop(0.5, 'rgba(190,235,250,0.28)')
        g.addColorStop(1, 'rgba(190,235,250,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
        // soften the sides
        const side = ctx.createLinearGradient(0, 0, w, 0)
        side.addColorStop(0, 'rgba(0,0,0,1)')
        side.addColorStop(0.25, 'rgba(0,0,0,0)')
        side.addColorStop(0.75, 'rgba(0,0,0,0)')
        side.addColorStop(1, 'rgba(0,0,0,1)')
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = side
        ctx.fillRect(0, 0, w, h)
      }),
    [],
  )

  const rays = useMemo(() => {
    const rand = mulberry32(99)
    return Array.from({ length: 6 }, () => ({
      x: -8 + rand() * 16,
      z: -4 - rand() * 6,
      w: 1.4 + rand() * 1.8,
      tilt: (rand() - 0.5) * 0.34,
      yaw: (rand() - 0.5) * 0.8,
      base: 0.09 + rand() * 0.08,
      phase: rand() * Math.PI * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = reduced ? 0 : clock.elapsedTime
    g.children.forEach((ray, i) => {
      const r = rays[i]
      ray.rotation.z = r.tilt + Math.sin(t * 0.18 + r.phase) * 0.025
      const m = (ray as THREE.Mesh).material as THREE.MeshBasicMaterial
      m.opacity = THREE.MathUtils.lerp(
        m.opacity,
        r.base * (0.75 + 0.25 * Math.sin(t * 0.3 + r.phase)) * (1 - pollution * 0.85),
        0.05,
      )
    })
  })

  return (
    <group ref={group}>
      {rays.map((r, i) => (
        <mesh key={i} position={[r.x, 1.5, r.z]} rotation={[0, r.yaw, r.tilt]}>
          <planeGeometry args={[r.w, 17]} />
          <meshBasicMaterial
            transparent
            opacity={r.base}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            fog={false}
          >
            <canvasTexture attach="map" args={[rayCanvas]} />
          </meshBasicMaterial>
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Seabed, caustics, rocks, shells                                     */
/* ------------------------------------------------------------------ */

function useSeabedGeometry() {
  return useMemo(() => {
    const geo = new THREE.PlaneGeometry(72, 42, 58, 34)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position
    const colors = new Float32Array(pos.count * 3)
    const sandLight = new THREE.Color('#c7b58f')
    const sandDark = new THREE.Color('#77694c')
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const h = terrainHeight(x, z)
      pos.setY(i, h)
      const shade = THREE.MathUtils.clamp((h + 0.9) / 1.9, 0, 1)
      c.copy(sandDark).lerp(sandLight, shade)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])
}

function Seabed({ pollution, reduced }: SceneProps) {
  const geometry = useSeabedGeometry()
  const causticsA = useRef<THREE.CanvasTexture>(null)
  const causticsB = useRef<THREE.CanvasTexture>(null)
  const causMatA = useRef<THREE.MeshBasicMaterial>(null)
  const causMatB = useRef<THREE.MeshBasicMaterial>(null)

  const causticCanvas = useMemo(() => {
    const rand = mulberry32(2024)
    return makeCanvas(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
      ctx.shadowColor = 'rgba(255,255,255,0.9)'
      ctx.shadowBlur = 5
      for (let i = 0; i < 70; i++) {
        ctx.strokeStyle = `rgba(255,255,255,${0.14 + rand() * 0.2})`
        ctx.lineWidth = 1.5 + rand() * 2.5
        ctx.beginPath()
        ctx.ellipse(
          rand() * w,
          rand() * h,
          6 + rand() * 26,
          5 + rand() * 20,
          rand() * Math.PI,
          rand() * 2,
          rand() * 2 + 3.2,
        )
        ctx.stroke()
      }
    })
  }, [])

  const rocks = useMemo(() => {
    const rand = mulberry32(555)
    return Array.from({ length: 9 }, () => {
      const x = -16 + rand() * 32
      const z = -7 + rand() * 7.5
      return {
        x,
        z,
        y: floorY(x, z) + 0.1,
        r: 0.28 + rand() * 0.55,
        sx: 0.8 + rand() * 0.6,
        sy: 0.55 + rand() * 0.5,
        rot: rand() * Math.PI * 2,
        shade: 0.4 + rand() * 0.35,
      }
    })
  }, [])

  const shells = useMemo(() => {
    const rand = mulberry32(77)
    return Array.from({ length: 7 }, () => {
      const x = -10 + rand() * 20
      const z = -1 - rand() * 5
      return { x, z, y: floorY(x, z) + 0.03, rot: rand() * Math.PI * 2, s: 0.7 + rand() * 0.7 }
    })
  }, [])

  const stonesRef = useRef<THREE.InstancedMesh>(null)
  const stones = useMemo(() => {
    const rand = mulberry32(31)
    return Array.from({ length: 44 }, () => {
      const x = -17 + rand() * 34
      const z = -7.5 + rand() * 8
      return { x, z, y: floorY(x, z) + 0.03, s: 0.4 + rand() * 1.1, rot: rand() * Math.PI }
    })
  }, [])

  useEffect(() => {
    const m = stonesRef.current
    if (!m) return
    const dummy = new THREE.Object3D()
    stones.forEach((s, i) => {
      dummy.position.set(s.x, s.y, s.z)
      dummy.scale.setScalar(s.s)
      dummy.rotation.set(0, s.rot, 0)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [stones])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    if (causticsA.current) causticsA.current.offset.set(t * 0.011, t * 0.007)
    if (causticsB.current) causticsB.current.offset.set(-t * 0.008, t * 0.01)
    const target = 0.16 * (1 - pollution * 0.9)
    if (causMatA.current) {
      causMatA.current.opacity = THREE.MathUtils.lerp(causMatA.current.opacity, target, 0.05)
    }
    if (causMatB.current) {
      causMatB.current.opacity = THREE.MathUtils.lerp(causMatB.current.opacity, target * 0.7, 0.05)
    }
  })

  return (
    <group>
      {/* sand */}
      <mesh geometry={geometry} position={[0, FLOOR_Y, -3]}>
        <meshStandardMaterial vertexColors roughness={1} metalness={0} />
      </mesh>

      {/* caustic light webs draped on the same terrain */}
      <mesh geometry={geometry} position={[0, FLOOR_Y + 0.03, -3]}>
        <meshBasicMaterial
          ref={causMatA}
          color="#9fe8ff"
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        >
          <canvasTexture
            attach="map"
            args={[causticCanvas]}
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
            repeat={new THREE.Vector2(4, 2.5)}
            ref={causticsA}
          />
        </meshBasicMaterial>
      </mesh>
      <mesh geometry={geometry} position={[0, FLOOR_Y + 0.05, -3]}>
        <meshBasicMaterial
          ref={causMatB}
          color="#b8f1ff"
          transparent
          opacity={0.11}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        >
          <canvasTexture
            attach="map"
            args={[causticCanvas]}
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
            repeat={new THREE.Vector2(3, 2)}
            ref={causticsB}
          />
        </meshBasicMaterial>
      </mesh>

      {/* rocks */}
      {rocks.map((r, i) => (
        <mesh
          key={i}
          position={[r.x, r.y, r.z]}
          rotation={[0, r.rot, 0]}
          scale={[r.r * r.sx, r.r * r.sy, r.r]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.08, 0.08, r.shade * 0.55)}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* small stones */}
      <instancedMesh ref={stonesRef} args={[undefined, undefined, 44]}>
        <sphereGeometry args={[0.07, 6, 5]} />
        <meshStandardMaterial color="#8d8471" roughness={1} />
      </instancedMesh>

      {/* shells */}
      {shells.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[-0.3, s.rot, 0]} scale={s.s}>
          <sphereGeometry args={[0.1, 10, 6, 0, Math.PI]} />
          <meshStandardMaterial color="#e9dfc9" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Vegetation                                                          */
/* ------------------------------------------------------------------ */

const grassDummy = new THREE.Object3D()

function GrassPatch({
  count,
  seed,
  color,
  reduced,
}: {
  count: number
  seed: number
  color: string
  reduced: boolean
}) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const blades = useMemo(() => {
    const rand = mulberry32(seed)
    return Array.from({ length: count }, () => {
      const x = -14 + rand() * 28
      const z = -6.2 + rand() * 6
      return {
        x,
        z,
        y: floorY(x, z),
        h: 0.6 + rand() * 1.15,
        yaw: rand() * Math.PI,
        phase: rand() * Math.PI * 2,
        speed: 0.55 + rand() * 0.5,
        amp: 0.12 + rand() * 0.1,
      }
    })
  }, [count, seed])

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.085, 1, 1, 3)
    g.translate(0, 0.5, 0)
    return g
  }, [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = reduced ? 0 : clock.elapsedTime
    for (let i = 0; i < blades.length; i++) {
      const b = blades[i]
      grassDummy.position.set(b.x, b.y, b.z)
      grassDummy.scale.set(1, b.h, 1)
      grassDummy.rotation.set(
        0,
        b.yaw,
        Math.sin(t * b.speed + b.phase) * b.amp + Math.sin(t * 0.21 + b.x * 0.4) * 0.05,
      )
      grassDummy.updateMatrix()
      m.setMatrixAt(i, grassDummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]}>
      <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function SeaGrass({ reduced }: { reduced: boolean }) {
  return (
    <group>
      <GrassPatch count={50} seed={11} color="#2e7d5f" reduced={reduced} />
      <GrassPatch count={45} seed={23} color="#1f8a74" reduced={reduced} />
      <GrassPatch count={40} seed={47} color="#5f7a3a" reduced={reduced} />
    </group>
  )
}

function KelpStalk({
  x,
  z,
  phase,
  reduced,
}: {
  x: number
  z: number
  phase: number
  reduced: boolean
}) {
  const segs = useRef<(THREE.Group | null)[]>([])
  const SEGMENTS = 6
  const SEG_LEN = 0.62

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    for (let i = 0; i < SEGMENTS; i++) {
      const g = segs.current[i]
      if (!g) continue
      const depth = (i + 1) / SEGMENTS
      g.rotation.z = Math.sin(t * 0.42 + phase + i * 0.65) * 0.075 * depth
      g.rotation.x = Math.sin(t * 0.3 + phase + i * 0.4) * 0.04 * depth
    }
  })

  // nested chain: each segment is a child of the previous
  const buildSegment = (i: number): React.ReactNode => {
    if (i >= SEGMENTS) return null
    return (
      <group
        ref={(el) => {
          segs.current[i] = el
        }}
        position={[0, i === 0 ? 0 : SEG_LEN, 0]}
      >
        <mesh position={[0, SEG_LEN / 2, 0]}>
          <cylinderGeometry args={[0.028, 0.036, SEG_LEN, 5]} />
          <meshStandardMaterial color="#3c6b34" roughness={0.8} />
        </mesh>
        <mesh position={[0.14, SEG_LEN * 0.6, 0]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[0.3, 0.14]} />
          <meshStandardMaterial color="#4b7d3c" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.13, SEG_LEN * 0.35, 0.02]} rotation={[0, 0.3, 0.55]}>
          <planeGeometry args={[0.28, 0.13]} />
          <meshStandardMaterial color="#46752f" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {buildSegment(i + 1)}
      </group>
    )
  }

  return <group position={[x, floorY(x, z), z]}>{buildSegment(0)}</group>
}

function Kelp({ reduced }: { reduced: boolean }) {
  return (
    <>
      <KelpStalk x={-8.5} z={-5.2} phase={0} reduced={reduced} />
      <KelpStalk x={-7.6} z={-4.4} phase={1.7} reduced={reduced} />
      <KelpStalk x={8.2} z={-5.6} phase={3.1} reduced={reduced} />
      <KelpStalk x={9.4} z={-4.6} phase={4.6} reduced={reduced} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Coral reef                                                          */
/* ------------------------------------------------------------------ */

/** Shared health-color lerp for a coral's materials. */
function useCoralHealth(healthy: string, pollution: number) {
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const healthyColor = useMemo(() => new THREE.Color(healthy), [healthy])
  useFrame(() => {
    for (const m of mats.current) {
      if (m) m.color.lerp(healthyColor.clone().lerp(CORAL_DEAD, pollution), 0.035)
    }
  })
  return (i: number) => (el: THREE.MeshStandardMaterial | null) => {
    mats.current[i] = el
  }
}

function BrainCoral({
  x,
  z,
  r,
  color,
  pollution,
}: {
  x: number
  z: number
  r: number
  color: string
  pollution: number
}) {
  const bind = useCoralHealth(color, pollution)
  const geometry = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 3)
    const pos = g.attributes.position
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const bump =
        1 +
        0.06 * Math.sin(v.x * 9 + v.y * 7) +
        0.05 * Math.sin(v.y * 11 + v.z * 8) +
        0.04 * Math.sin(v.z * 13 + v.x * 6)
      v.multiplyScalar(bump)
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geometry} position={[x, floorY(x, z) + r * 0.55, z]} scale={[r, r * 0.72, r]}>
      <meshStandardMaterial ref={bind(0)} color={color} roughness={0.9} />
    </mesh>
  )
}

function FanCoral({
  x,
  z,
  s,
  color,
  pollution,
  reduced,
}: {
  x: number
  z: number
  s: number
  color: string
  pollution: number
  reduced: boolean
}) {
  const bind = useCoralHealth(color, pollution)
  const group = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.5 + x) * 0.035
    }
  })

  return (
    <group ref={group} position={[x, floorY(x, z), z]} scale={s}>
      <mesh position={[0, 0.62, 0]}>
        <circleGeometry args={[0.65, 20, 0, Math.PI]} />
        <meshStandardMaterial
          ref={bind(0)}
          color={color}
          roughness={0.8}
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.5, 5]} />
        <meshStandardMaterial ref={bind(1)} color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

function BranchCoral({
  x,
  z,
  s,
  color,
  pollution,
}: {
  x: number
  z: number
  s: number
  color: string
  pollution: number
}) {
  const bind = useCoralHealth(color, pollution)
  const branches = useMemo(() => {
    const rand = mulberry32(Math.round(x * 13 + z * 7))
    return Array.from({ length: 9 }, (_, i) => ({
      angle: (i / 9) * Math.PI * 2 + rand() * 0.5,
      tilt: 0.25 + rand() * 0.35,
      h: 0.55 + rand() * 0.5,
      r: 0.045 + rand() * 0.02,
    }))
  }, [x, z])

  return (
    <group position={[x, floorY(x, z), z]} scale={s}>
      {branches.map((b, i) => (
        <group
          key={i}
          rotation={[Math.sin(b.angle) * b.tilt, 0, Math.cos(b.angle) * b.tilt]}
        >
          <mesh position={[0, b.h / 2, 0]}>
            <cylinderGeometry args={[b.r * 0.6, b.r, b.h, 5]} />
            <meshStandardMaterial ref={bind(i * 2)} color={color} roughness={0.85} />
          </mesh>
          <mesh position={[0, b.h, 0]}>
            <sphereGeometry args={[b.r * 1.35, 6, 5]} />
            <meshStandardMaterial ref={bind(i * 2 + 1)} color={color} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TubeCoral({
  x,
  z,
  s,
  color,
  pollution,
}: {
  x: number
  z: number
  s: number
  color: string
  pollution: number
}) {
  const bind = useCoralHealth(color, pollution)
  const tubes = useMemo(() => {
    const rand = mulberry32(Math.round(x * 31 + z * 17))
    return Array.from({ length: 5 }, () => ({
      ox: (rand() - 0.5) * 0.5,
      oz: (rand() - 0.5) * 0.5,
      h: 0.3 + rand() * 0.45,
      r: 0.07 + rand() * 0.05,
    }))
  }, [x, z])

  return (
    <group position={[x, floorY(x, z), z]} scale={s}>
      {tubes.map((tb, i) => (
        <group key={i} position={[tb.ox, 0, tb.oz]}>
          <mesh position={[0, tb.h / 2, 0]}>
            <cylinderGeometry args={[tb.r, tb.r * 1.15, tb.h, 8, 1, true]} />
            <meshStandardMaterial
              ref={bind(i)}
              color={color}
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function SoftCoral({
  x,
  z,
  s,
  color,
  pollution,
  reduced,
}: {
  x: number
  z: number
  s: number
  color: string
  pollution: number
  reduced: boolean
}) {
  const bind = useCoralHealth(color, pollution)
  const group = useRef<THREE.Group>(null)
  const bulbs = useMemo(() => {
    const rand = mulberry32(Math.round(x * 5 + z * 3) + 9)
    return Array.from({ length: 8 }, () => ({
      ox: (rand() - 0.5) * 0.55,
      oy: 0.1 + rand() * 0.3,
      oz: (rand() - 0.5) * 0.55,
      r: 0.09 + rand() * 0.09,
    }))
  }, [x, z])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    if (group.current) {
      const breathe = 1 + Math.sin(t * 0.7 + x * 2) * 0.03
      group.current.scale.set(s * breathe, s * breathe, s * breathe)
    }
  })

  return (
    <group ref={group} position={[x, floorY(x, z), z]} scale={s}>
      {bulbs.map((b, i) => (
        <mesh key={i} position={[b.ox, b.oy, b.oz]}>
          <sphereGeometry args={[b.r, 8, 6]} />
          <meshStandardMaterial ref={bind(i)} color={color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}

function CoralGarden({ pollution, reduced }: SceneProps) {
  return (
    <group>
      <BranchCoral x={-5.6} z={-2.2} s={1.25} color="#d98a76" pollution={pollution} />
      <BrainCoral x={-3.1} z={-3.6} r={0.75} color="#c98a92" pollution={pollution} />
      <FanCoral x={-1.4} z={-2.1} s={1.1} color="#b07bc4" pollution={pollution} reduced={reduced} />
      <TubeCoral x={-0.9} z={-2.7} s={1} color="#c9a066" pollution={pollution} />
      <SoftCoral x={0.9} z={-3.7} s={1.15} color="#4da58a" pollution={pollution} reduced={reduced} />
      <BranchCoral x={2.7} z={-2.4} s={0.95} color="#7ba8a0" pollution={pollution} />
      <BrainCoral x={4.5} z={-3.7} r={0.5} color="#c99a6b" pollution={pollution} />
      <FanCoral x={6.1} z={-2.2} s={0.85} color="#c4798a" pollution={pollution} reduced={reduced} />
      <TubeCoral x={-7} z={-4.3} s={1.2} color="#8aa06b" pollution={pollution} />
      <SoftCoral x={7.6} z={-4} s={0.9} color="#b4838f" pollution={pollution} reduced={reduced} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Fish                                                                */
/* ------------------------------------------------------------------ */

type Species = {
  id: string
  size: number
  tailColor: string
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
}

function paintBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: string,
  belly: string,
) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, top)
  g.addColorStop(0.55, top)
  g.addColorStop(1, belly)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function paintEyes(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (const u of [0.21, 0.79]) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.arc(u * w, h * 0.38, 3.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0b1220'
    ctx.beginPath()
    ctx.arc(u * w, h * 0.38, 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

const SPECIES: Species[] = [
  {
    id: 'clownfish',
    size: 0.5,
    tailColor: '#e8863f',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#e07a33', '#f0af6e')
      ctx.fillStyle = '#f6f1e4'
      ctx.strokeStyle = 'rgba(20,25,35,0.65)'
      ctx.lineWidth = 1.6
      for (const u of [0.3, 0.5, 0.7]) {
        ctx.beginPath()
        ctx.rect(u * w - 5, 0, 10, h)
        ctx.fill()
        ctx.stroke()
      }
      paintEyes(ctx, w, h)
    },
  },
  {
    id: 'bluetang',
    size: 0.62,
    tailColor: '#d9b23f',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#2b5fa8', '#4a83c4')
      ctx.fillStyle = 'rgba(12,22,44,0.55)'
      ctx.beginPath()
      ctx.ellipse(w * 0.5, h * 0.3, w * 0.22, h * 0.16, 0.3, 0, Math.PI * 2)
      ctx.fill()
      paintEyes(ctx, w, h)
    },
  },
  {
    id: 'butterfly',
    size: 0.5,
    tailColor: '#d9c25f',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#dcc25e', '#ecd98f')
      ctx.fillStyle = 'rgba(15,20,30,0.8)'
      for (const u of [0.21, 0.79]) {
        ctx.fillRect(u * w - 3.5, 0, 7, h)
      }
      paintEyes(ctx, w, h)
    },
  },
  {
    id: 'angelfish',
    size: 0.72,
    tailColor: '#8fa8bc',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#93a9bc', '#c3d2dc')
      ctx.strokeStyle = 'rgba(60,100,140,0.5)'
      ctx.lineWidth = 2.5
      for (const u of [0.36, 0.5, 0.64]) {
        ctx.beginPath()
        ctx.moveTo(u * w, 0)
        ctx.quadraticCurveTo(u * w + 6, h / 2, u * w, h)
        ctx.stroke()
      }
      paintEyes(ctx, w, h)
    },
  },
  {
    id: 'silver',
    size: 0.36,
    tailColor: '#9fb0ba',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#8d9ba5', '#cfdae0')
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fillRect(0, h * 0.55, w, 3)
      paintEyes(ctx, w, h)
    },
  },
  {
    id: 'yellowreef',
    size: 0.42,
    tailColor: '#cf9a3d',
    paint: (ctx, w, h) => {
      paintBase(ctx, w, h, '#cfa93d', '#e5cd7a')
      ctx.fillStyle = 'rgba(150,90,20,0.35)'
      ctx.fillRect(0, 0, w, 4)
      paintEyes(ctx, w, h)
    },
  },
]

type FishDef = {
  species: number
  cx: number
  cy: number
  cz: number
  rx: number
  rz: number
  speed: number
  dir: 1 | -1
  phase: number
  bobPhase: number
  bobAmp: number
  jitterPhase: number
  wag: number
  scale: number
}

function buildFishDefs(): FishDef[] {
  const rand = mulberry32(4242)
  const defs: FishDef[] = []

  const school = (
    species: number,
    n: number,
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    rz: number,
    speed: number,
    dir: 1 | -1,
  ) => {
    const basePhase = rand() * Math.PI * 2
    for (let i = 0; i < n; i++) {
      defs.push({
        species,
        cx: cx + (rand() - 0.5) * 0.8,
        cy: cy + (rand() - 0.5) * 0.9,
        cz: cz + (rand() - 0.5) * 0.7,
        rx: rx * (0.92 + rand() * 0.16),
        rz: rz * (0.92 + rand() * 0.16),
        speed: speed * (0.94 + rand() * 0.12),
        dir,
        phase: basePhase + i * 0.16 + rand() * 0.06,
        bobPhase: rand() * Math.PI * 2,
        bobAmp: 0.18 + rand() * 0.2,
        jitterPhase: rand() * Math.PI * 2,
        wag: 5 + rand() * 3,
        scale: 0.85 + rand() * 0.3,
      })
    }
  }

  school(4, 9, 0, 1.7, -3.6, 5.4, 2.6, 0.3, 1) // silver school, mid-water
  school(5, 8, 1.4, -1.5, -2.6, 3.8, 1.9, 0.26, -1) // yellow reef fish, low
  school(1, 5, -1, 0.4, -3.2, 6, 3, 0.2, 1) // blue tangs, wide

  // solo feature fish
  const solo = (
    species: number,
    cx: number,
    cy: number,
    cz: number,
    rx: number,
    rz: number,
    speed: number,
    dir: 1 | -1,
  ) =>
    defs.push({
      species,
      cx,
      cy,
      cz,
      rx,
      rz,
      speed,
      dir,
      phase: rand() * Math.PI * 2,
      bobPhase: rand() * Math.PI * 2,
      bobAmp: 0.22,
      jitterPhase: rand() * Math.PI * 2,
      wag: 4.5 + rand() * 2,
      scale: 1,
    })

  solo(0, -5.4, -1.8, -2.4, 1.4, 0.9, 0.5, 1) // clownfish pair by the branch coral
  solo(0, -5.7, -1.6, -2.2, 1.1, 0.7, 0.55, -1)
  solo(2, 2.7, -1.2, -2.6, 1.9, 1.2, 0.4, 1) // butterflies by the reef
  solo(2, 5.9, -0.9, -2.5, 2.2, 1.4, 0.34, -1)
  solo(3, 0, 0.9, -3.4, 6.6, 3.4, 0.14, -1) // angelfish, slow and wide

  return defs
}

function FishPopulation({ pollution, reduced }: SceneProps) {
  const defs = useMemo(() => buildFishDefs(), [])
  const groups = useRef<(THREE.Group | null)[]>([])
  const runtime = useRef<{ prevYaw: number; bank: number; tail?: THREE.Object3D | null }[]>(
    defs.map(() => ({ prevYaw: 0, bank: 0 })),
  )

  const textures = useMemo(
    () =>
      SPECIES.map((s) => {
        const canvas = makeCanvas(128, 64, (ctx, w, h) => s.paint(ctx, w, h))
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
      }),
    [],
  )

  const bodyGeo = useMemo(() => new THREE.SphereGeometry(1, 22, 14), [])
  const tailGeo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.42, 0.55, 4)
    g.scale(1, 1, 0.22)
    return g
  }, [])
  const finGeo = useMemo(() => new THREE.PlaneGeometry(0.55, 0.24), [])

  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime
    const alive = Math.round(defs.length * (1 - pollution))
    for (let i = 0; i < defs.length; i++) {
      const g = groups.current[i]
      if (!g) continue
      const d = defs[i]
      const rt = runtime.current[i]

      const a = d.dir * (t * d.speed + d.phase)
      const jx = Math.sin(t * 0.9 + d.jitterPhase) * 0.22
      const jz = Math.cos(t * 0.7 + d.jitterPhase * 1.3) * 0.18
      const px = d.cx + Math.cos(a) * d.rx + jx
      const pz = d.cz + Math.sin(a) * d.rz + jz
      const py = d.cy + Math.sin(t * 0.45 + d.bobPhase) * d.bobAmp
      g.position.set(px, py, pz)

      // heading from path tangent (fish forward = +x)
      const dx = -Math.sin(a) * d.rx * d.dir
      const dz = Math.cos(a) * d.rz * d.dir
      const yaw = Math.atan2(-dz, dx)
      const turn = shortestAngle(yaw - rt.prevYaw)
      rt.prevYaw = yaw
      rt.bank = THREE.MathUtils.lerp(rt.bank, THREE.MathUtils.clamp(turn * 26, -0.45, 0.45), 0.06)
      g.rotation.set(rt.bank, yaw, Math.sin(t * 0.5 + d.bobPhase) * 0.05)

      // population thins as pollution rises
      const target = i < alive ? SPECIES[d.species].size * d.scale : 0
      const s = THREE.MathUtils.lerp(g.scale.x, target, 0.05)
      g.scale.setScalar(s)

      // tail wag
      if (rt.tail === undefined) rt.tail = g.getObjectByName('tail')
      if (rt.tail) rt.tail.rotation.y = Math.sin(t * d.wag + d.phase * 3) * 0.5
    }
  })

  return (
    <group>
      {defs.map((d, i) => {
        const sp = SPECIES[d.species]
        return (
          <group
            key={i}
            ref={(el) => {
              groups.current[i] = el
            }}
            scale={sp.size * d.scale}
          >
            {/* body */}
            <mesh geometry={bodyGeo} scale={[1, d.species === 3 ? 0.72 : 0.52, 0.3]}>
              <meshStandardMaterial map={textures[d.species]} roughness={0.55} metalness={0.15} />
            </mesh>
            {/* tail */}
            <group name="tail" position={[-0.92, 0, 0]}>
              <mesh geometry={tailGeo} position={[-0.18, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <meshStandardMaterial
                  color={sp.tailColor}
                  roughness={0.6}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.95}
                />
              </mesh>
            </group>
            {/* dorsal fin */}
            <mesh geometry={finGeo} position={[0.05, d.species === 3 ? 0.72 : 0.55, 0]}>
              <meshStandardMaterial
                color={sp.tailColor}
                roughness={0.6}
                side={THREE.DoubleSide}
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Sea turtle                                                          */
/* ------------------------------------------------------------------ */

function Turtle({ pollution, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const flippers = useRef<(THREE.Group | null)[]>([])
  const rt = useRef({ prevYaw: 0 })

  const shellTexture = useMemo(() => {
    const rand = mulberry32(717)
    const canvas = makeCanvas(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#49644a'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 16; i++) {
        const x = rand() * w
        const y = rand() * h
        const r = 9 + rand() * 15
        ctx.fillStyle = `rgba(28,45,32,${0.4 + rand() * 0.3})`
        ctx.beginPath()
        for (let k = 0; k < 6; k++) {
          const ang = (k / 6) * Math.PI * 2 + rand() * 0.3
          const rr = r * (0.85 + rand() * 0.3)
          const px = x + Math.cos(ang) * rr
          const py = y + Math.sin(ang) * rr
          if (k === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
      }
    })
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = reduced ? 0 : clock.elapsedTime

    const speed = 0.085
    const a = t * speed + 1.4
    const px = Math.cos(a) * 8.4
    const pz = -1 + Math.sin(a) * 5.6
    const py = 1.2 + Math.sin(t * 0.14) * 1.1
    g.position.set(px, py, pz)

    const dx = -Math.sin(a)
    const dz = Math.cos(a) * (5.6 / 8.4)
    const yaw = Math.atan2(-dz, dx)
    rt.current.prevYaw = yaw
    g.rotation.set(Math.sin(t * 0.2) * 0.08, yaw, Math.sin(t * 0.16) * 0.06)

    // vanish in badly polluted water
    const target = pollution > 0.75 ? 0 : 1
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, 0.03))

    flippers.current.forEach((f, i) => {
      if (!f) return
      const front = i < 2
      const side = i % 2 === 0 ? 1 : -1
      const amp = front ? 0.5 : 0.22
      f.rotation.z = side * (Math.sin(t * 1.15 + (front ? 0 : 1.2)) * amp - 0.12)
    })
  })

  return (
    <group ref={group}>
      {/* shell */}
      <mesh scale={[1.05, 0.42, 0.8]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial map={shellTexture} roughness={0.75} />
      </mesh>
      {/* belly */}
      <mesh position={[0, -0.18, 0]} scale={[0.92, 0.22, 0.68]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#cfc39a" roughness={0.8} />
      </mesh>
      {/* head */}
      <mesh position={[1.15, 0.08, 0]} scale={[0.32, 0.24, 0.22]}>
        <sphereGeometry args={[1, 12, 9]} />
        <meshStandardMaterial color="#5d7a58" roughness={0.8} />
      </mesh>
      {/* flippers: FL, FR, BL, BR */}
      {[
        [0.55, 0.62],
        [0.55, -0.62],
        [-0.62, 0.5],
        [-0.62, -0.5],
      ].map(([fx, fz], i) => (
        <group
          key={i}
          position={[fx, -0.05, fz]}
          ref={(el) => {
            flippers.current[i] = el
          }}
        >
          <mesh
            position={[i < 2 ? 0.22 : 0.12, 0, fz > 0 ? 0.3 : -0.3]}
            rotation={[0, fz > 0 ? -0.5 : 0.5, 0]}
            scale={i < 2 ? [0.55, 0.06, 0.26] : [0.34, 0.05, 0.2]}
          >
            <sphereGeometry args={[1, 10, 7]} />
            <meshStandardMaterial color="#55704f" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Crabs                                                               */
/* ------------------------------------------------------------------ */

function Crab({
  cx,
  cz,
  range,
  phase,
  reduced,
}: {
  cx: number
  cz: number
  range: number
  phase: number
  reduced: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Mesh | null)[]>([])
  const rt = useRef({ walkT: 0, last: 0 })

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = reduced ? 0 : clock.elapsedTime
    const dt = Math.min(t - rt.current.last, 0.1)
    rt.current.last = t

    // smooth stop-and-go gait
    const gate = 1 / (1 + Math.exp(-5 * Math.sin(t * 0.14 + phase)))
    rt.current.walkT += dt * gate

    const wt = rt.current.walkT
    const x = cx + Math.sin(wt * 0.5 + phase) * range
    const z = cz
    g.position.set(x, floorY(x, z) + 0.09, z)

    legs.current.forEach((leg, i) => {
      if (!leg) return
      const side = i < 3 ? 1 : -1
      leg.rotation.x = side * 0.5 + Math.sin(wt * 7 + i * 1.1) * 0.3 * gate
    })
  })

  return (
    <group ref={group}>
      {/* body */}
      <mesh scale={[0.2, 0.11, 0.15]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#a3543c" roughness={0.7} />
      </mesh>
      {/* claws */}
      <mesh position={[0.09, 0.02, 0.17]} scale={[0.06, 0.045, 0.05]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#b0604a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.09, 0.02, 0.17]} scale={[0.06, 0.045, 0.05]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#b0604a" roughness={0.7} />
      </mesh>
      {/* legs */}
      {Array.from({ length: 6 }, (_, i) => {
        const side = i < 3 ? 1 : -1
        const off = (i % 3) - 1
        return (
          <mesh
            key={i}
            ref={(el) => {
              legs.current[i] = el
            }}
            position={[off * 0.09, -0.03, side * 0.14]}
            rotation={[side * 0.5, 0, 0]}
          >
            <cylinderGeometry args={[0.008, 0.012, 0.16, 4]} />
            <meshStandardMaterial color="#8d4936" roughness={0.75} />
          </mesh>
        )
      })}
    </group>
  )
}

function Crabs({ reduced }: { reduced: boolean }) {
  return (
    <>
      <Crab cx={-2.2} cz={-1.4} range={1.3} phase={0.4} reduced={reduced} />
      <Crab cx={3.6} cz={-1.8} range={1} phase={2.6} reduced={reduced} />
      <Crab cx={-6.4} cz={-3.2} range={0.8} phase={4.4} reduced={reduced} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Particles                                                           */
/* ------------------------------------------------------------------ */

const partDummy = new THREE.Object3D()

function Microplastics({ pollution, reduced }: SceneProps) {
  const POOL = 380
  const mesh = useRef<THREE.InstancedMesh>(null)

  const seeds = useMemo(() => {
    const rand = mulberry32(1337)
    return Array.from({ length: POOL }, () => ({
      x: (rand() - 0.5) * 24,
      y: rand() * 11 - 3.5,
      z: (rand() - 0.5) * 14,
      s: rand() * 0.032 + 0.014,
      phase: rand() * Math.PI * 2,
      speed: rand() * 0.15 + 0.05,
    }))
  }, [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = reduced ? 0 : clock.elapsedTime
    const visible = Math.round(POOL * pollution)
    for (let i = 0; i < POOL; i++) {
      const p = seeds[i]
      if (i < visible) {
        partDummy.position.set(
          p.x + Math.sin(t * p.speed + p.phase) * 0.6,
          p.y + Math.sin(t * p.speed * 0.7 + p.phase) * 0.4,
          p.z,
        )
        partDummy.scale.setScalar(p.s)
      } else {
        partDummy.scale.setScalar(0)
      }
      partDummy.rotation.set(t * 0.2 + p.phase, t * 0.15, 0)
      partDummy.updateMatrix()
      m.setMatrixAt(i, partDummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, POOL]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#e8a55c"
        emissive="#8a5322"
        emissiveIntensity={0.35}
        roughness={0.6}
      />
    </instancedMesh>
  )
}

function Bubbles({ reduced }: { reduced: boolean }) {
  const COUNT = 36
  const mesh = useRef<THREE.InstancedMesh>(null)

  const seeds = useMemo(() => {
    const rand = mulberry32(606)
    return Array.from({ length: COUNT }, () => ({
      x: (rand() - 0.5) * 22,
      z: -7 + rand() * 8,
      y0: rand() * 10,
      speed: 0.35 + rand() * 0.45,
      wobble: rand() * Math.PI * 2,
      s: 0.5 + rand() * 1.1,
    }))
  }, [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = reduced ? 0 : clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      const b = seeds[i]
      const y = ((b.y0 + t * b.speed) % 10) - 3.4
      partDummy.position.set(b.x + Math.sin(t * 1.4 + b.wobble) * 0.14, y, b.z)
      const grow = 0.6 + ((y + 3.4) / 10) * 0.7
      partDummy.scale.setScalar(0.032 * b.s * grow)
      partDummy.rotation.set(0, 0, 0)
      partDummy.updateMatrix()
      m.setMatrixAt(i, partDummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color="#c9ecf7"
        transparent
        opacity={0.32}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  )
}

function DriftingPoints({
  count,
  seed,
  size,
  color,
  opacity,
  additive,
  fall,
  reduced,
}: {
  count: number
  seed: number
  size: number
  color: string
  opacity: number
  additive?: boolean
  fall: number
  reduced: boolean
}) {
  const attr = useRef<THREE.BufferAttribute>(null)

  const { base, phases } = useMemo(() => {
    const rand = mulberry32(seed)
    const base = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rand() - 0.5) * 26
      base[i * 3 + 1] = rand() * 11 - 3.4
      base[i * 3 + 2] = -8 + rand() * 10
      phases[i] = rand() * Math.PI * 2
    }
    return { base, phases }
  }, [count, seed])

  const positions = useMemo(() => new Float32Array(base), [base])

  useFrame(({ clock }) => {
    const a = attr.current
    if (!a) return
    const t = reduced ? 0 : clock.elapsedTime
    const arr = a.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ph = phases[i]
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.12 + ph) * 0.7
      let y = base[i * 3 + 1] - t * fall
      y = ((((y + 3.4) % 11) + 11) % 11) - 3.4
      arr[i * 3 + 1] = y + Math.sin(t * 0.3 + ph) * 0.15
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.1 + ph) * 0.4
    }
    a.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={attr} attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Camera + demand-mode plumbing                                       */
/* ------------------------------------------------------------------ */

function CameraSway({ reduced }: { reduced: boolean }) {
  useFrame(({ camera, clock }) => {
    if (reduced) return
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.1) * 0.55
    camera.position.y = 0.9 + Math.sin(t * 0.075) * 0.28
    camera.position.z = 9 + Math.sin(t * 0.05) * 0.3
    camera.lookAt(0, 0.1, -2)
  })
  return null
}

/** Forces a burst of frames on pollution change when frameloop is 'demand'. */
function DemandInvalidator({ pollution }: { pollution: number }) {
  const { invalidate } = useThree()
  useEffect(() => {
    let n = 0
    const tick = () => {
      invalidate()
      if (++n < 160) requestAnimationFrame(tick)
    }
    tick()
  }, [pollution, invalidate])
  return null
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export default function OceanScene({
  pollution,
  reduced,
  active,
}: SceneProps & { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.9, 9], fov: 52 }}
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? 'always' : 'demand'}
      aria-hidden="true"
    >
      <hemisphereLight args={['#bae6fd', '#0a3d55', 0.7]} />
      <directionalLight position={[4, 12, 3]} intensity={1.5} color="#e8f7ff" />
      <pointLight position={[-8, 3, -6]} intensity={0.35} color="#22d3ee" />
      <pointLight position={[6, -1, 2]} intensity={0.22} color="#14b8a6" />

      <Water pollution={pollution} />
      <Backdrop pollution={pollution} />
      <WaterSurface pollution={pollution} reduced={reduced} />
      <GodRays pollution={pollution} reduced={reduced} />

      <Seabed pollution={pollution} reduced={reduced} />
      <SeaGrass reduced={reduced} />
      <Kelp reduced={reduced} />
      <CoralGarden pollution={pollution} reduced={reduced} />

      <FishPopulation pollution={pollution} reduced={reduced} />
      <Turtle pollution={pollution} reduced={reduced} />
      <Crabs reduced={reduced} />

      <Microplastics pollution={pollution} reduced={reduced} />
      <Bubbles reduced={reduced} />
      {/* marine snow (sinking) + fine dust (suspended, additive) */}
      <DriftingPoints
        count={240}
        seed={91}
        size={0.055}
        color="#dbeafe"
        opacity={0.45}
        fall={0.12}
        reduced={reduced}
      />
      <DriftingPoints
        count={200}
        seed={137}
        size={0.028}
        color="#a5f3fc"
        opacity={0.35}
        additive
        fall={0.03}
        reduced={reduced}
      />

      <CameraSway reduced={reduced} />
      {(!active || reduced) && <DemandInvalidator pollution={pollution} />}
    </Canvas>
  )
}
