import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Background3DProps {
  threatLevel?: string;
  activeMode?: 'orbital' | 'tactical';
}

const NeuralNodes = ({ threatLevel, activeMode, particleCount }: { threatLevel: string, activeMode: 'orbital' | 'tactical', particleCount: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, mathColors] = useMemo(() => {
    const p = new Float32Array(particleCount * 3);
    const c = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      const color = new THREE.Color();
      if (threatLevel === 'critical' || threatLevel === 'high') {
        color.setHSL(0.95 + Math.random() * 0.05, 1.0, 0.5);
      } else if (threatLevel === 'medium') {
        color.setHSL(0.08 + Math.random() * 0.08, 1.0, 0.5);
      } else {
        color.setHSL(0.5 + Math.random() * 0.1, 1.0, 0.5);
      }
      c[i * 3] = color.r;
      c[i * 3 + 1] = color.g;
      c[i * 3 + 2] = color.b;
    }
    
    return [p, c];
  }, [particleCount, threatLevel]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      let speedFactor = 1.0;
      if (threatLevel === 'critical' || threatLevel === 'high') speedFactor = 3.0;
      else if (threatLevel === 'medium') speedFactor = 2.0;

      pointsRef.current.rotation.x -= (delta * speedFactor) / 10;
      pointsRef.current.rotation.y -= (delta * speedFactor) / 15;
    }
  });

  const opacity = activeMode === 'tactical' ? 0.08 : 0.65;

  return (
    <Points ref={pointsRef} positions={positions} colors={mathColors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={activeMode === 'tactical' ? 0.1 : 0.18}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={opacity}
      />
    </Points>
  );
};

export const Background3D: React.FC<Background3DProps> = ({ threatLevel = 'low', activeMode = 'orbital' }) => {
  const [particleCount, setParticleCount] = useState(150);
  const [currentMode, setCurrentMode] = useState(activeMode);
  const [currentThreat, setCurrentThreat] = useState(threatLevel);

  useEffect(() => {
    const handleModeUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.mode) {
        setCurrentMode(customEvent.detail.mode);
      }
    };
    const handleThreatUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.level) {
        setCurrentThreat(customEvent.detail.level);
      }
    };

    window.addEventListener('spartanai-security-core-dashboard-mode', handleModeUpdate);
    window.addEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
    return () => {
      window.removeEventListener('spartanai-security-core-dashboard-mode', handleModeUpdate);
      window.removeEventListener('spartanai-security-core-threat-level', handleThreatUpdate);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 1280) {
        setParticleCount(25);
      } else if (w >= 2560) {
        setParticleCount(300);
      } else {
        setParticleCount(150);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#020408]">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        {particleCount > 0 && (
          <NeuralNodes threatLevel={currentThreat} activeMode={currentMode} particleCount={particleCount} />
        )}
      </Canvas>
    </div>
  );
};
