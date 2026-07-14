'use client'

import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

/**
 * pollution: 0 (pristine) → 1 (heavily polluted)
 * Drives water color, particle density, fish population, coral vitality.
 */
type SceneProps = {
  pollution: number
  reduced: boolean
}

const CLEAN_WATER = new THREE.Color('#0a3d62')
const DIRTY_WATER = new THREE.Color('#25353a')
const CLEAN_FOG = new THREE.Color('#0e4d75')
const DIRTY_FOG = new THREE.Color('#2a3a3c')

function Water({ pollution }: { pollution: number }) {
  const bg = useRef<THREE.Color>(null)
  const fogRef = useRef<THREE.Fog>(null)

  useFrame(() => {
    if (bg.current) {
      bg.current.lerp(CLEAN_WATER.clone().lerp(DIRTY_WATER, pollution), 0.04)
    }
    const fog = fogRef.current
    if (fog) {
      fog.color.lerp(CLEAN_FOG.clone().lerp(DIRTY_FOG, pollution), 0.04)
      fog.far = THREE.MathUtils.lerp(fog.far, 26 - pollution * 10, 0.04)
    }
  })

  return (
    <>
      <color ref={bg} attach="background" args={['#0a3d62']} />
      <fog ref={fogRef} attach="fog" args={['#0e4d75', 6, 26]} />
    </>
  )
}

const PARTICLE_POOL = 380
const dummy = new THREE.Object3D()

/** Deterministic PRNG — pure across re-renders, consistent visuals. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Microplastics({ pollution, reduced }: SceneProps) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const seeds = useMemo(() => {
    const rand = mulberry32(1337)
    return Array.from({ length: PARTICLE_POOL }, () => ({
      x: (rand() - 0.5) * 22,
      y: rand() * 12 - 4,
      z: (rand() - 0.5) * 16,
      s: rand() * 0.05 + 0.02,
      phase: rand() * Math.PI * 2,
      speed: rand() * 0.15 + 0.05,
    }))
  }, [])

  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m) return
    const t = reduced ? 0 : clock.elapsedTime
    const visible = Math.round(PARTICLE_POOL * pollution)
    for (let i = 0; i < PARTICLE_POOL; i++) {
      const p = seeds[i]
      if (i < visible) {
        dummy.position.set(
          p.x + Math.sin(t * p.speed + p.phase) * 0.6,
          p.y + Math.sin(t * p.speed * 0.7 + p.phase) * 0.4,
          p.z,
        )
        dummy.scale.setScalar(p.s)
      } else {
        dummy.scale.setScalar(0)
      }
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_POOL]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#ffb062"
        emissive="#c76e2e"
        emissiveIntensity={0.4}
        roughness={0.6}
      />
    </instancedMesh>
  )
}

const FISH_COUNT = 14

function Fish({ pollution, reduced }: SceneProps) {
  const group = useRef<THREE.Group>(null)

  const school = useMemo(
    () =>
      Array.from({ length: FISH_COUNT }, (_, i) => ({
        radius: 3.5 + (i % 5) * 1.3,
        height: -1.5 + ((i * 7) % 10) * 0.45,
        speed: 0.25 + (i % 4) * 0.08,
        phase: (i / FISH_COUNT) * Math.PI * 2,
        scale: 0.65 + (i % 3) * 0.25,
      })),
    [],
  )

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = reduced ? 0 : clock.elapsedTime
    const alive = Math.round(FISH_COUNT * (1 - pollution))
    g.children.forEach((fish, i) => {
      const f = school[i]
      const targetScale = i < alive ? f.scale : 0
      fish.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05,
      )
      const a = t * f.speed + f.phase
      fish.position.set(
        Math.cos(a) * f.radius,
        f.height + Math.sin(t * 0.5 + f.phase) * 0.3,
        Math.sin(a) * f.radius - 2,
      )
      fish.rotation.y = -a - Math.PI / 2
    })
  })

  return (
    <group ref={group}>
      {school.map((f, i) => (
        <group key={i} scale={f.scale}>
          {/* body */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.16, 0.7, 8]} />
            <meshStandardMaterial
              color="#9fd8e8"
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
          {/* tail */}
          <mesh position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.13, 0.25, 6]} />
            <meshStandardMaterial
              color="#7fc2d6"
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const CORAL_HEALTHY = new THREE.Color('#ff8a7a')
const CORAL_HEALTHY_2 = new THREE.Color('#c86bd9')
const CORAL_DEAD = new THREE.Color('#5a6468')

function CoralCluster({
  position,
  pollution,
  variant,
}: {
  position: [number, number, number]
  pollution: number
  variant: 0 | 1
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)

  const branches = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        angle: (i / 6) * Math.PI * 2 + variant,
        tilt: 0.3 + (i % 3) * 0.18,
        h: 0.7 + ((i * 13) % 5) * 0.22,
      })),
    [variant],
  )

  useFrame(() => {
    if (!mat.current) return
    const healthy = variant === 0 ? CORAL_HEALTHY : CORAL_HEALTHY_2
    mat.current.color.lerp(
      healthy.clone().lerp(CORAL_DEAD, pollution),
      0.04,
    )
  })

  return (
    <group position={position}>
      {branches.map((b, i) => (
        <mesh
          key={i}
          position={[Math.cos(b.angle) * 0.25, b.h / 2, Math.sin(b.angle) * 0.25]}
          rotation={[Math.sin(b.angle) * b.tilt, 0, Math.cos(b.angle) * b.tilt]}
        >
          <coneGeometry args={[0.09, b.h, 6]} />
          <meshStandardMaterial ref={i === 0 ? mat : undefined} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Corals({ pollution }: { pollution: number }) {
  const spots: { pos: [number, number, number]; v: 0 | 1 }[] = [
    { pos: [-4.5, -3.5, -1], v: 0 },
    { pos: [-2.2, -3.5, -3], v: 1 },
    { pos: [0.8, -3.5, -2], v: 0 },
    { pos: [3.4, -3.5, -3.5], v: 1 },
    { pos: [5.2, -3.5, -1.5], v: 0 },
  ]
  return (
    <>
      {spots.map((s, i) => (
        <CoralCluster key={i} position={s.pos} pollution={pollution} variant={s.v} />
      ))}
      {/* seafloor */}
      <mesh position={[0, -3.6, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 26]} />
        <meshStandardMaterial color="#1c3345" roughness={1} />
      </mesh>
    </>
  )
}

function CameraSway({ reduced }: { reduced: boolean }) {
  useFrame(({ camera, clock }) => {
    if (reduced) return
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.12) * 0.5
    camera.position.y = 0.4 + Math.sin(t * 0.09) * 0.25
    camera.lookAt(0, -0.6, -2)
  })
  return null
}

/** Forces a re-render on pollution change when frameloop is 'demand'. */
function DemandInvalidator({ pollution }: { pollution: number }) {
  const { invalidate } = useThree()
  useEffect(() => {
    // a short burst of frames lets lerps settle even in demand mode
    let n = 0
    const tick = () => {
      invalidate()
      if (++n < 90) requestAnimationFrame(tick)
    }
    tick()
  }, [pollution, invalidate])
  return null
}

export default function OceanScene({
  pollution,
  reduced,
  active,
}: SceneProps & { active: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7], fov: 55 }}
      dpr={[1, 1.5]}
      frameloop={active && !reduced ? 'always' : 'demand'}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} color="#7fd4e8" />
      <directionalLight position={[3, 10, 2]} intensity={1.6} color="#bfeaf5" />
      <pointLight position={[-6, 4, -4]} intensity={0.5} color="#59c2d8" />

      <Water pollution={pollution} />
      <Microplastics pollution={pollution} reduced={reduced} />
      <Fish pollution={pollution} reduced={reduced} />
      <Corals pollution={pollution} />
      <CameraSway reduced={reduced} />
      {(!active || reduced) && <DemandInvalidator pollution={pollution} />}
    </Canvas>
  )
}
