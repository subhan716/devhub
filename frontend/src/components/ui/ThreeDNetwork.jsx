import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 1. Quantum Torus Knot Core with Dynamic Morphing Glow
const QuantumCore = ({ config }) => {
  const knotRef = useRef();
  const innerSphereRef = useRef();
  const cageRef = useRef();

  const coreColor = config?.coreColor || '#00F0FF';
  const secondaryColor = config?.secondaryColor || '#8A2BE2';
  const speed = config?.speed || 1.0;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;

    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.4;
      knotRef.current.rotation.y = t * 0.6;
      knotRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }

    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.y = -t * 0.8;
      const scale = 1 + Math.sin(t * 2) * 0.08;
      innerSphereRef.current.scale.set(scale, scale, scale);
    }

    if (cageRef.current) {
      cageRef.current.rotation.x = -t * 0.2;
      cageRef.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group>
      {/* Central Pulsing Plasma Sphere */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={3.5}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>

      {/* Futuristic Quantum Torus Knot with Wireframe Glow */}
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh ref={knotRef}>
          <torusKnotGeometry args={[1.55, 0.22, 128, 32, 2, 3]} />
          <MeshDistortMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={1.8}
            distort={0.25}
            speed={2}
            roughness={0.2}
            metalness={0.85}
            transparent={true}
            opacity={0.88}
          />
        </mesh>
      </Float>

      {/* Outer Holographic Icosahedron Geometric Shell */}
      <mesh ref={cageRef} scale={2.4}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={1.2}
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* Dynamic Quantum Orbit Rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.7, 0.02, 16, 100]} />
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00F0FF"
          emissiveIntensity={3}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[3.0, 0.018, 16, 100]} />
        <meshStandardMaterial
          color="#FF0055"
          emissive="#FF0055"
          emissiveIntensity={2.5}
        />
      </mesh>
    </group>
  );
};

// 2. Interactive Constellation Network Matrix
const ConstellationField = () => {
  const pointsRef = useRef();
  const count = 70;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color('#00F0FF'),
      new THREE.Color('#8A2BE2'),
      new THREE.Color('#FF0055'),
      new THREE.Color('#10B981')
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 3.2 + Math.random() * 2.2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const chosen = colorChoices[i % colorChoices.length];
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// 3. Main 3D Interactive Network Component
const ThreeDNetwork = ({ config }) => {
  return (
    <div className="w-full h-full relative group cursor-grab active:cursor-grabbing select-none">
      {/* Ambient Neon Atmosphere Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00F0FF]/20 via-[#8A2BE2]/15 to-[#FF0055]/20 blur-[110px] rounded-full pointer-events-none" />

      {/* Floating HUD Widget 1 (Top Left) */}
      <div className="absolute top-2 left-2 sm:left-4 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
          <div className="absolute w-4 h-4 rounded-full bg-[#00F0FF]/40 animate-ping" />
        </div>
        <div className="text-left">
          <p className="text-[9px] uppercase font-mono tracking-widest text-[#00F0FF] font-bold">Quantum Core Active</p>
          <p className="text-xs font-bold text-white">50K+ Nodes Connected</p>
        </div>
      </div>

      {/* Floating HUD Widget 2 (Bottom Right) */}
      <div className="absolute bottom-2 right-2 sm:right-4 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_20px_rgba(138,43,226,0.2)]">
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#00F0FF] via-[#8A2BE2] to-[#FF0055] flex items-center justify-center font-bold text-xs text-black shadow-md">
          ✦
        </div>
        <div className="text-left">
          <p className="text-[9px] uppercase font-mono tracking-widest text-purple-400 font-bold">Neural Discovery</p>
          <p className="text-xs font-bold text-white">Founders • Creators • Engineers</p>
        </div>
      </div>

      {/* Three.js Hardware-Accelerated 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Interactive Smooth Drag Rotation */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.8}
          rotateSpeed={0.6}
          dampingFactor={0.05}
        />

        {/* Dense Volumetric Cyber Sparkles */}
        <Sparkles
          count={120}
          scale={7}
          size={3}
          speed={0.6}
          opacity={0.8}
          color="#00F0FF"
        />
        <Sparkles
          count={80}
          scale={6}
          size={2.5}
          speed={0.4}
          opacity={0.7}
          color="#FF0055"
        />
        
        {/* Dynamic Studio Lighting */}
        <ambientLight intensity={0.9} />
        <pointLight position={[10, 10, 10]} intensity={3} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={2.5} color="#FF0055" />
        <pointLight position={[0, 10, 5]} intensity={2} color="#8A2BE2" />

        {/* 3D Meshes */}
        <QuantumCore config={config} />
        <ConstellationField />
      </Canvas>
    </div>
  );
};

export default ThreeDNetwork;
