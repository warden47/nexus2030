// components/three/ParticleBackground.tsx
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Particle Field ────────────────────────────────────
function ParticleField({ count = 800, mouseFactor = 0.5 }) {
  const mesh = useRef<THREE.Points>(null);
  const { pointer } = useThree(); // normalized mouse [-1,1]

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();
    const palette = ['#6C5CE7', '#00F2FE', '#FF4785'];

    for (let i = 0; i < count; i++) {
      // spherical distribution
      const r = 2 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      color.set(palette[Math.floor(Math.random() * palette.length)]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    // subtle rotation based on mouse
    mesh.current.rotation.y += 0.0003;
    mesh.current.rotation.x += 0.0001;
    // shift whole field toward mouse
    const targetX = pointer.x * mouseFactor;
    const targetY = pointer.y * mouseFactor;
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.02;
    mesh.current.position.y += (targetY - mesh.current.position.y) * 0.02;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

// ─── Main Component ────────────────────────────────────
export default function ParticleBackground({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 z-0 ${className ?? ''}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <ParticleField />
      </Canvas>
    </div>
  );
}