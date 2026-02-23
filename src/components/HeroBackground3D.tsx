"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

const VERTEX_SHADER = `
  uniform float uTime;
  varying vec3 vNormal;
  varying float vDisplacement;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    float displacement = sin(position.x * 1.5 + uTime * 0.4) *
                         cos(position.y * 1.5 + uTime * 0.3) *
                         sin(position.z * 1.5 + uTime * 0.5) * 0.15;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec3 vNormal;
  varying float vDisplacement;

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    vec3 color = mix(uColor1, uColor2, fresnel + vDisplacement);
    float alpha = 0.08 + fresnel * 0.12;
    gl_FragColor = vec4(color, alpha);
  }
`;

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function HeroBackground3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el || !hasWebGL()) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 5;

    // Low-poly icosahedron with custom shader
    const geo = new THREE.IcosahedronGeometry(2.5, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color("#00FF94") },
        uColor2: { value: new THREE.Color("#06b6d4") },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Floating particles
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      size: 0.015,
      color: "#00FF94",
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(particleGeo, particleMat);
    scene.add(points);

    // Resize handler
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // Animation loop
    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mat.uniforms.uTime.value = t;
      mesh.rotation.x = t * 0.05;
      mesh.rotation.y = t * 0.08;
      points.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (el.contains(renderer.domElement)) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    init();
    return () => {
      cleanupRef.current?.();
    };
  }, [init]);

  return (
    <>
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      {/* CSS fallback (hidden once canvas mounts, visible if WebGL fails) */}
      <noscript>
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#00FF94]/10 blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#06b6d4]/10 blur-[120px] mix-blend-screen animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
        </div>
      </noscript>
    </>
  );
}
