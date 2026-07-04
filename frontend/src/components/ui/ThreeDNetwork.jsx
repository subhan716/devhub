import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Line } from '@react-three/drei';
import * as THREE from 'three';

// Helper to generate random points
const generateNodes = (count, range) => {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range,
        (Math.random() - 0.5) * range
      )
    );
  }
  return nodes;
};

// Component for the rotating group of nodes and lines
const NetworkGroup = () => {
  const groupRef = useRef();
  
  // Generate 40 random points for our nodes
  const nodes = useMemo(() => generateNodes(40, 10), []);
  
  // Slowly rotate the entire network
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Draw Spheres (Nodes) */}
      {nodes.map((pos, i) => (
        <Float key={`node-${i}`} speed={2} rotationIntensity={1} floatIntensity={2}>
          <mesh position={pos}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#00F0FF" : "#FF0055"} 
              emissive={i % 2 === 0 ? "#00F0FF" : "#FF0055"} 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </mesh>
        </Float>
      ))}

      {/* Draw Lines (Connections between nearby nodes) */}
      {nodes.map((node, i) => {
        return nodes.map((otherNode, j) => {
          // Only connect if they are close enough, and don't connect to itself
          if (i !== j && node.distanceTo(otherNode) < 4) {
            return (
              <Line
                key={`line-${i}-${j}`}
                points={[node, otherNode]}
                color="#8A2BE2"
                lineWidth={0.5}
                transparent
                opacity={0.3}
              />
            );
          }
          return null;
        });
      })}
    </group>
  );
};

const ThreeDNetwork = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        {/* Background stars */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#FF0055" />

        {/* The Node Network */}
        <NetworkGroup />
      </Canvas>
    </div>
  );
};

export default ThreeDNetwork;
