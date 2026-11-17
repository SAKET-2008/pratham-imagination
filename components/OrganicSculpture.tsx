"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Sculpture() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(2.2, 5);

    const position = geo.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);

      const length = Math.sqrt(x * x + y * y + z * z);

      const nx = x / length;
      const ny = y / length;
      const nz = z / length;

      // Organic deformation
      const wave1 =
        Math.sin(nx * 3.5 + ny * 2.2) * 0.22;

      const wave2 =
        Math.sin(ny * 5.0 + nz * 2.5) * 0.14;

      const wave3 =
        Math.cos(nz * 4.0 + nx * 3.0) * 0.12;

      const scale =
        1 + wave1 + wave2 + wave3;

      position.setXYZ(
        i,
        nx * length * scale,
        ny * length * scale,
        nz * length * scale
      );
    }

    geo.computeVertexNormals();

    return geo;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x =
      Math.sin(time * 0.35) * 0.08;

    meshRef.current.position.y =
      Math.sin(time * 0.5) * 0.08;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={1.15}
    >
      <meshPhysicalMaterial
        color="#777777"
        metalness={1}
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.08}
        reflectivity={1}
      />
    </mesh>
  );
}

export default function OrganicSculpture() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 38,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.25} />

        <directionalLight
          position={[4, 5, 6]}
          intensity={4}
        />

        <directionalLight
          position={[-5, -2, 3]}
          intensity={2}
        />

        <pointLight
          position={[0, 4, 4]}
          intensity={8}
        />

        <Environment
          preset="studio"
          environmentIntensity={2}
        />

        <Sculpture />
      </Canvas>
    </div>
  );
}