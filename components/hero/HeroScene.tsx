"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

interface HeroSceneProps { scrollProgress: number; }
interface SculptureProps extends HeroSceneProps { mobile: boolean; }

function Sculpture({ scrollProgress, mobile }: SculptureProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  const dragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  // Touch devices never get direct 3D interaction. Scroll animation still works.
  const isTouchDevice =
    typeof window !== "undefined" &&
    (navigator.maxTouchPoints > 0 || "ontouchstart" in window);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, mobile ? 3 : 5);
    const position = geo.attributes.position;
    const original = new Float32Array(position.array.length);
    original.set(position.array);
    geo.userData.originalPositions = original;
    return geo;
  }, [mobile]);

  const pointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (isTouchDevice || e.nativeEvent?.pointerType !== "mouse") return;
    e.stopPropagation();
    dragging.current = true;
    previousPointer.current = {
      x: e.nativeEvent.clientX,
      y: e.nativeEvent.clientY,
    };
    document.body.style.cursor = "grabbing";
  };

  const pointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isTouchDevice || e.nativeEvent?.pointerType !== "mouse") return;
    if (!dragging.current || !mesh.current) return;
    const x = e.nativeEvent.clientX;
    const y = e.nativeEvent.clientY;
    const dx = x - previousPointer.current.x;
    const dy = y - previousPointer.current.y;
    mesh.current.rotation.y += dx * 0.007;
    mesh.current.rotation.x += dy * 0.005;
    velocity.current.y = dx * 0.0035;
    velocity.current.x = dy * 0.0025;
    previousPointer.current = { x, y };
  };

  const pointerUp = (e?: ThreeEvent<PointerEvent>) => {
    if (isTouchDevice) return;
    if (e?.nativeEvent?.pointerType && e.nativeEvent.pointerType !== "mouse") return;
    dragging.current = false;
    document.body.style.cursor = "default";
  };

  // eslint-disable-next-line react-hooks/immutability -- Three.js geometry and mesh state are intentionally mutated per frame.
  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const p = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    const position = geometry.attributes.position;
    const original = geometry.userData.originalPositions as Float32Array;

    for (let i = 0; i < position.count; i++) {
      const index = i * 3;
      const ox = original[index];
      const oy = original[index + 1];
      const oz = original[index + 2];
      const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const safeLength = Math.max(length, 0.0001);
      const nx = ox / safeLength;
      const ny = oy / safeLength;
      const nz = oz / safeLength;
      const waveA = Math.sin(nx * 3.2 + time * 0.55) * 0.11;
      const waveB = Math.sin(ny * 4.8 - time * 0.42) * 0.08;
      const waveC = Math.sin(nz * 5.4 + nx * 2 + time * 0.35) * 0.075;
      const bulge = Math.pow(Math.max(0, Math.sin(nx * 2 + ny * 1.4)), 3) * 0.13;
      const deformation = 1 + waveA + waveB + waveC + bulge;
      position.setXYZ(i, ox * deformation, oy * deformation, oz * deformation);
    }

    // eslint-disable-next-line react-hooks/immutability -- Notify Three.js that the animated vertex buffer changed.
    position.needsUpdate = true;
    geometry.computeVertexNormals();

    const exit = THREE_SMOOTHSTEP(p, 0.70, 0.96);

    if (!dragging.current) {
      velocity.current.x *= 0.94;
      velocity.current.y *= 0.94;
      mesh.current.rotation.y += 0.0015 + velocity.current.y;
      mesh.current.rotation.x += velocity.current.x;

      // Mouse parallax is naturally desktop-only; touch devices do not update
      // the R3F mouse from their vertical scroll gesture.
      if (!isTouchDevice && p < 0.65) {
        mesh.current.rotation.y += (mouse.x * 0.22 - mesh.current.rotation.y) * 0.008;
        mesh.current.rotation.x += (-mouse.y * 0.16 - mesh.current.rotation.x) * 0.008;
      }
    }

    mesh.current.rotation.y += exit * 0.045;
    mesh.current.rotation.x += exit * 0.018;
    mesh.current.rotation.z = exit * 0.35;

    const startX = 1.15;
    const exitX = startX + exit * 5.5;
    mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, exitX, 0.055);
    mesh.current.position.y = Math.sin(time * 0.55) * 0.1 - exit * 0.4;
    mesh.current.position.z = exit * -2.5;

    const scale = 1.55 - exit * 0.65;
    mesh.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);

    const material = mesh.current.material as THREE.MeshPhysicalMaterial;
    material.opacity = 1 - exit * 0.92;
    material.transparent = exit > 0.01;
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[1.15, 0.05, 0]}
      scale={1.55}
      // Handlers remain available for desktop mouse interaction only.
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerMissed={() => pointerUp()}
      onPointerOver={(e) => {
        if (isTouchDevice || e.nativeEvent?.pointerType !== "mouse") return;
        document.body.style.cursor = "grab";
      }}
      onPointerOut={(e) => {
        if (isTouchDevice || e.nativeEvent?.pointerType !== "mouse") return;
        if (!dragging.current) document.body.style.cursor = "default";
      }}
    >
      <meshPhysicalMaterial
        color="#c7c8ca"
        metalness={1}
        roughness={0.12}
        clearcoat={1}
        clearcoatRoughness={0.045}
        reflectivity={1}
        envMapIntensity={6}
        transparent
      />
    </mesh>
  );
}

function THREE_SMOOTHSTEP(x: number, edge0: number, edge1: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <rectAreaLight width={6} height={8} position={[4, 5, 4]} intensity={8} />
      <pointLight position={[5, 1, 4]} intensity={12} distance={12} />
      <pointLight position={[-5, 1, 2]} intensity={9} distance={12} />
      <pointLight position={[1, -5, 3]} intensity={5} distance={10} />
    </>
  );
}

function Scene({ scrollProgress, mobile }: SculptureProps) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 5, 17]} />
      <StudioLighting />
      <Sculpture scrollProgress={scrollProgress} mobile={mobile} />
      <Sparkles count={mobile ? 14 : 45} scale={10} size={0.45} speed={0.08} opacity={0.08} />
      <Environment resolution={mobile ? 128 : 512} environmentIntensity={3}>
        <Lightformer
          form="rect"
          intensity={7}
          color="white"
          position={[0, 5, -5]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          form="rect"
          intensity={5}
          color="#d9e5ff"
          position={[-5, 1, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[2, 7, 1]}
        />
        <Lightformer
          form="rect"
          intensity={6}
          color="#ffe0bd"
          position={[5, 0, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 8, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          color="white"
          position={[0, -5, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[8, 3, 1]}
        />
      </Environment>
    </>
  );
}

export default function HeroScene({ scrollProgress }: HeroSceneProps) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px), (pointer: coarse)");
    const updateMobileMode = () => setMobile(query.matches);

    updateMobileMode();
    query.addEventListener("change", updateMobileMode);
    return () => query.removeEventListener("change", updateMobileMode);
  }, []);

  return (
    <div
      className="hero-scene absolute inset-0 z-0"
      // Critical: browser handles vertical finger movement as page scrolling.
      style={{ touchAction: "pan-y" }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        dpr={[1, mobile ? 1 : 1.5]}
        style={{ touchAction: "pan-y" }}
        gl={{
          antialias: !mobile,
          alpha: true,
          powerPreference: mobile ? "low-power" : "high-performance",
        }}
      >
        <Scene scrollProgress={scrollProgress} mobile={mobile} />
      </Canvas>
    </div>
  );
}
