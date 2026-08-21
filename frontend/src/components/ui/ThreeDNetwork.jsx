import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sphere, Torus, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

// 1. Central Holographic Crystal Energy Core
const HolographicCore = ({ config }) => {
  const meshRef = useRef();
  const innerRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    const speed = config?.speed || 1.0;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.25 * speed + pointer.y * 0.4;
      meshRef.current.rotation.y = t * 0.35 * speed + pointer.x * 0.4;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.4 * speed;
      innerRef.current.rotation.y = -t * 0.5 * speed;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.2;
      ring1Ref.current.rotation.y = t * 0.6 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = Math.PI / 4 + Math.cos(t * 0.4) * 0.2;
      ring2Ref.current.rotation.z = -t * 0.4 * speed;
    }
  });

  return (
    <group>
      {/* Outer Distorted Plasma Hologram Core */}
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh ref={meshRef} scale={1.8}>
          <icosahedronGeometry args={[1, 4]} />
          <MeshDistortMaterial
            color={config?.coreColor || "#00F0FF"}
            attach="material"
            distort={0.42}
            speed={2}
            roughness={0.1}
            metalness={0.8}
            wireframe={true}
            transparent={true}
            opacity={0.75}
          />
        </mesh>
      </Float>

      {/* Inner Glowing Crystal Solid Core */}
      <mesh ref={innerRef} scale={1.1}>
        <octahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={config?.secondaryColor || "#8A2BE2"}
          emissive={config?.secondaryColor || "#8A2BE2"}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Orbital Neon Energy Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.7, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Orbital Neon Energy Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#FF0055"
          emissive="#FF0055"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

// 2. Dynamic Orbiting Data Nodes with Light Trails
const OrbitingNodes = () => {
  const count = 16;
  const nodes = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      radius: 3.8 + (i % 3) * 0.8,
      speed: 0.3 + (i % 4) * 0.15,
      offset: (i * Math.PI * 2) / count,
      color: i % 3 === 0 ? "#00F0FF" : i % 3 === 1 ? "#8A2BE2" : "#FF0055",
      size: 0.09 + (i % 3) * 0.04
    }));
  }, []);

  return (
    <group>
      {nodes.map((node, i) => (
        <OrbitingParticle key={i} {...node} />
      ))}
    </group>
  );
};

const OrbitingParticle = ({ radius, speed, offset, color, size }) => {
  const ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + offset;
    const x = Math.cos(t) * radius;
    const y = Math.sin(t * 1.5) * (radius * 0.35);
    const z = Math.sin(t) * radius;
    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3.5}
        toneMapped={false}
      />
    </mesh>
  );
};

// 3. Deep Starfield Matrix
const ThreeDNetwork = ({ config }) => {
  return (
    <div className="w-full h-full relative group cursor-grab active:cursor-grabbing select-none">
      {/* Ambient Pulsing Glow Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/15 via-[#8A2BE2]/15 to-[#FF0055]/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Floating Interactive Badge Overlays */}
      <div className="absolute -top-4 -left-4 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-2xl animate-bounce duration-[4000ms]">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
        <div className="text-left">
          <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Live Network Pulse</p>
          <p className="text-xs font-bold text-white">50K+ Global Innovators Active</p>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/60 border border-[#00F0FF]/30 backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.25)]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#8A2BE2] flex items-center justify-center font-bold text-xs text-black">
          ⚡
        </div>
        <div className="text-left">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#00F0FF] font-bold">Neural Matching</p>
          <p className="text-xs font-bold text-white">Founders • Creators • Engineers</p>
        </div>
      </div>

      {/* Three.js Hardware-Accelerated Canvas */}
      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Stars radius={80} depth={40} count={3500} factor={4} saturation={1} fade speed={1.2} />
        
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#FF0055" />
        <pointLight position={[0, 10, -5]} intensity={1.5} color="#8A2BE2" />

        <HolographicCore config={config} />
        <OrbitingNodes />
      </Canvas>
    </div>
  );
};

export default ThreeDNetwork;
