'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch {
    return false
  }
}

export default function HeroBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const init = useCallback(() => {
    const el = containerRef.current
    if (!el || !hasWebGL()) return

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.06)

    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 5.5)

    // Torus Knot — frosted glass + dark metal
    const torusGeo = new THREE.TorusKnotGeometry(1.4, 0.45, 200, 32, 2, 3)
    const torusMat = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      metalness: 0.2,
      roughness: 0.6,
      transmission: 0.7,
      thickness: 1.5,
      ior: 1.5,
      iridescence: 0.3,
      iridescenceIOR: 1.3,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      envMapIntensity: 0.8,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    })
    const torusMesh = new THREE.Mesh(torusGeo, torusMat)
    scene.add(torusMesh)

    // Subtle wireframe overlay
    const wireGeo = new THREE.TorusKnotGeometry(1.42, 0.46, 100, 16, 2, 3)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ff94,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    })
    const wireMesh = new THREE.Mesh(wireGeo, wireMat)
    scene.add(wireMesh)

    // 3-Point Lighting
    const keyLight = new THREE.DirectionalLight(0x0088ff, 3)
    keyLight.position.set(3, 2, 4)
    scene.add(keyLight)

    const fillLight = new THREE.PointLight(0x7722cc, 2.5, 15)
    fillLight.position.set(-4, -2, 2)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0x00ff94, 1.2)
    rimLight.position.set(0, 3, -5)
    scene.add(rimLight)

    scene.add(new THREE.AmbientLight(0x111122, 0.4))

    // Particles
    const particleCount = 350
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff94,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // Camera scroll state
    const cameraState = { scrollZ: 5.5, scrollRotY: 0 }

    // GSAP scroll-driven camera push
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
      onUpdate: (self) => {
        const p = self.progress
        cameraState.scrollZ = 5.5 - p * 3.5
        cameraState.scrollRotY = p * Math.PI * 0.6
      },
    })

    const onResize = () => {
      if (!el) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let rafId: number

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      torusMesh.rotation.x = t * 0.08
      torusMesh.rotation.y = t * 0.12
      torusMesh.rotation.z = t * 0.03
      wireMesh.rotation.copy(torusMesh.rotation)

      // Breathing float
      camera.position.x = Math.sin(t * 0.5) * 0.08 + Math.sin(cameraState.scrollRotY) * 0.5
      camera.position.y = Math.cos(t * 0.7) * 0.06
      camera.position.z = cameraState.scrollZ
      camera.lookAt(0, 0, 0)

      particles.rotation.y = t * 0.015
      particles.rotation.x = t * 0.008

      fillLight.intensity = 2.5 + Math.sin(t * 1.5) * 0.5

      renderer.render(scene, camera)
    }
    animate()

    cleanupRef.current = () => {
      cancelAnimationFrame(rafId)
      scrollTrigger.kill()
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      torusGeo.dispose()
      torusMat.dispose()
      wireGeo.dispose()
      wireMat.dispose()
      particleGeo.dispose()
      particleMat.dispose()
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    init()
    return () => { cleanupRef.current?.() }
  }, [init])

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />
      <noscript>
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0088ff]/10 blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#7722cc]/10 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>
      </noscript>
    </>
  )
}
