// src/pages/RD.jsx
import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
  Sun as SunIcon,
  PaintBucket,
  Camera,
  Layers,
  Clock,
} from "lucide-react";
import "./RD.css";

// 3D model loader
function Model({ path }) {
  const { scene } = useGLTF(path);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.side = THREE.DoubleSide;
      }
    }
  });

  return <primitive object={scene} />;
}

// Slunce (directionalLight + vizualizace koule)
function SunLight({ position, intensity }) {
  return (
    <>
      <directionalLight
        position={position}
        intensity={intensity}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-radius={8}
        shadow-normalBias={0.05}
      />
      <mesh position={position}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          emissive="yellow"
          emissiveIntensity={2}
          color="yellow"
        />
      </mesh>
    </>
  );
}

// Interiérové světlo
function InteriorLight() {
  return (
    <spotLight
      position={[0, 0, 20]}
      angle={Math.PI / 6}
      penumbra={0.5}
      intensity={1.2}
      castShadow
      target-position={[0, 0, 0]}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
  );
}

// Kamera ovládání
function CameraController({ view }) {
  const { camera } = useThree();

  return null;
}

export default function RD() {
  const [bgColor, setBgColor] = useState("#121212");
  const [lightIntensity, setLightIntensity] = useState(1);
  const [timeHour, setTimeHour] = useState(12);
  const [modelType, setModelType] = useState("full");

  function getSunPosition(hour) {
    const radius = 30;
    const sunrise = 5;
    const sunset = 20;
    const minHeight = 2;
    const maxHeight = 90;

    if (hour < sunrise || hour > sunset) {
      return [0, -10, 0]; // noc
    }

    const t = (hour - sunrise) / (sunset - sunrise);
    const angle = t * Math.PI;
    const y = minHeight + Math.sin(angle) * (maxHeight - minHeight);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return [x, y, z];
  }

  function getModelPath(type) {
    switch (type) {
      case "full":
        return "/assets/kyjeee.glb";
      case "floor1":
        return "/assets/kyje.glb";
      case "floor2":
        return "/assets/kyje2.glb";
      case "floors":
        return "/assets/kyjee.glb";
      default:
        return null;
    }
  }

  const isPlan = modelType === "plan";
  const isInterior = modelType.startsWith("floor");

  return (
    <div className="rd-container flex">
      {/* SIDEBAR */}
      <div className="sidebar bg-gray-900 text-white p-6 w-72 flex flex-col gap-6 rounded-r-2xl shadow-xl">
        {/* Sekce: Barva */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            <PaintBucket className="w-4 h-4 text-blue-400" /> Barva pozadí
          </h3>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer border border-gray-700"
          />
        </div>

        {/* Sekce: Světlo (disabled) */}
        <div className="opacity-50 pointer-events-none">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            <SunIcon className="w-4 h-4 text-yellow-400" /> Světlo
          </h3>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={lightIntensity}
            onChange={(e) => setLightIntensity(e.target.value)}
            className="w-full accent-yellow-400"
          />
        </div>

        {/* Sekce: Čas dne (disabled) */}
        <div className="opacity-50 pointer-events-none">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            <Clock className="w-4 h-4 text-green-400" /> Čas dne
          </h3>
          <input
            type="range"
            min="0"
            max="23"
            step="1"
            value={timeHour}
            onChange={(e) => setTimeHour(parseInt(e.target.value))}
            className="w-full accent-green-400"
          />
        </div>

      

        {/* Sekce: Modely */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-cyan-400" /> Modely
          </h3>
          <div className="flex flex-col gap-2">
            {[
              ["Celý model", "full"],
              ["Model pater", "floors"],
              ["Patro 1", "floor1"],
              ["Patro 2", "floor2"],
              ["Půdorys", "plan"],
            ].map(([label, value]) => (
              <button
                key={value}
                onClick={() => setModelType(value)}
                className={`p-3 rounded-lg text-left font-medium transition ${
                  modelType === value
                    ? "bg-cyan-600 text-white shadow-lg"
                    : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CANVAS */}
      <div className="canvas-container flex-1">
        {isPlan ? (
          <div className="plan-view flex items-center justify-center h-full bg-gray-100">
            <img
              src="/assets/floorplan.png"
              alt="Půdorys"
              className="rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <Canvas
            shadows
            dpr={[1, 2]}
            style={{ background: bgColor }}
            camera={{ position: [0, 2, 7], fov: 50 }}
          >
            <color attach="background" args={[bgColor]} />
            <ambientLight intensity={0.2} />
            {!isInterior && (
              <SunLight
                position={getSunPosition(timeHour)}
                intensity={lightIntensity}
              />
            )}
            {isInterior && <InteriorLight />}
            <Model path={getModelPath(modelType)} />
            <OrbitControls enableDamping />
          </Canvas>
        )}
      </div>
    </div>
  );
}
