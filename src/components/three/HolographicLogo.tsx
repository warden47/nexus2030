// components/three/HolographicLogo.tsx
'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ─── Animated Logo Mesh ────────────────────────────────
function LogoMesh() {
  const mesh = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  useFrame((state) => {
    if (!mesh.current) return;
    // Gentle floating
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    // Rotate slowly
    mesh.current.rotation.y += 0.003;
    // Tilt with mouse
    mesh.current.rotation.x += (state.mouse.y * 0.1 - mesh.current.rotation.x) * 0.05;
    mesh.current.rotation.z += (state.mouse.x * 0.2 - mesh.current.rotation.z) * 0.05;
  });

  return (
    <Center>
      <Text3D
        ref={mesh}
        font="/fonts/Geist_Bold.json" // placeholder – replace with actual font path
        size={viewport.width * 0.3}
        height={0.15}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.02}
        bevelSize={0.02}
        bevelSegments={5}
      >
        NEXUS
        <meshPhysicalMaterial
          color="#6C5CE7"
          metalness={0.1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          side={THREE.DoubleSide}
        />
      </Text3D>
    </Center>
  );
}

// ─── Glass Environment ─────────────────────────────────
function GlassEnvironment() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = null; // transparent
  }, [scene]);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.4} />
      <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1.2} />
      <pointLight position={[-3, -2, 3]} color="#00F2FE" intensity={0.8} />
    </>
  );
}

// ─── Component ─────────────────────────────────────────
export default function HolographicLogo({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ''} w-full h-full min-h-[300px]`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <LogoMesh />
          <GlassEnvironment />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}