import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Box, Orbit, Waves, Zap, Magnet } from 'lucide-react';
import * as THREE from 'three';

const GRAVITY = 9.81;

// Projectile motion ball
function ProjectileBall({ position, color = '#00d4ff' }: { position: [number, number, number]; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

// Trajectory line
function TrajectoryLine({ points, color = '#00d4ff' }: { points: THREE.Vector3[]; color?: string }) {
  const lineRef = useRef<THREE.Line>(null);
  
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.geometry.setFromPoints(points);
    }
  }, [points]);

  return (
    <primitive object={new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color })
    )} />
  );
}

// Animated projectile
function AnimatedProjectile({ 
  v0, 
  angle, 
  isPlaying, 
  onPositionUpdate,
  onComplete 
}: { 
  v0: number; 
  angle: number; 
  isPlaying: boolean;
  onPositionUpdate: (x: number, y: number, t: number) => void;
  onComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const angleRad = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(angleRad);
  const vy = v0 * Math.sin(angleRad);

  useFrame((_, delta) => {
    if (!isPlaying || !meshRef.current) return;
    
    timeRef.current += delta;
    const t = timeRef.current;
    
    const x = vx * t;
    const y = vy * t - 0.5 * GRAVITY * t * t;
    
    if (y < 0) {
      onComplete();
      timeRef.current = 0;
      return;
    }
    
    meshRef.current.position.set(x, y, 0);
    onPositionUpdate(x, y, t);
  });

  useEffect(() => {
    if (!isPlaying) {
      timeRef.current = 0;
      if (meshRef.current) {
        meshRef.current.position.set(0, 0, 0);
      }
    }
  }, [isPlaying]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
    </mesh>
  );
}

// Pendulum simulation
function Pendulum({ length, angle, isPlaying }: { length: number; angle: number; isPlaying: boolean }) {
  const pivotRef = useRef<THREE.Group>(null);
  const angleRef = useRef((angle * Math.PI) / 180);
  const angularVelocityRef = useRef(0);

  useFrame((_, delta) => {
    if (!isPlaying || !pivotRef.current) return;
    
    const angularAcceleration = -(GRAVITY / length) * Math.sin(angleRef.current);
    angularVelocityRef.current += angularAcceleration * delta;
    angularVelocityRef.current *= 0.999; // Damping
    angleRef.current += angularVelocityRef.current * delta;
    
    pivotRef.current.rotation.z = angleRef.current;
  });

  useEffect(() => {
    angleRef.current = (angle * Math.PI) / 180;
    angularVelocityRef.current = 0;
  }, [angle, isPlaying]);

  return (
    <group position={[0, 3, 0]}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <group ref={pivotRef}>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, length, 8]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, -length, 0]}>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Spring oscillator
function SpringOscillator({ k, mass, amplitude, isPlaying }: { k: number; mass: number; amplitude: number; isPlaying: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const omega = Math.sqrt(k / mass);

  useFrame((_, delta) => {
    if (!isPlaying || !meshRef.current) return;
    
    timeRef.current += delta;
    const x = amplitude * Math.cos(omega * timeRef.current);
    meshRef.current.position.x = x;
  });

  useEffect(() => {
    timeRef.current = 0;
    if (meshRef.current) {
      meshRef.current.position.x = amplitude;
    }
  }, [amplitude, isPlaying]);

  // Create spring visual
  const springPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = 10;
    const height = 2;
    for (let i = 0; i <= coils * 20; i++) {
      const t = i / (coils * 20);
      const x = Math.sin(t * coils * Math.PI * 2) * 0.2;
      const z = Math.cos(t * coils * Math.PI * 2) * 0.2;
      const y = -t * height;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  return (
    <group position={[0, 2, 0]}>
      <mesh>
        <boxGeometry args={[1, 0.2, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh ref={meshRef} position={[amplitude, -2.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Orbital motion
function OrbitalMotion({ radius, period, isPlaying }: { radius: number; period: number; isPlaying: boolean }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const omega = (2 * Math.PI) / period;

  useFrame((_, delta) => {
    if (!isPlaying || !planetRef.current) return;
    
    timeRef.current += delta;
    const angle = omega * timeRef.current;
    planetRef.current.position.x = radius * Math.cos(angle);
    planetRef.current.position.z = radius * Math.sin(angle);
  });

  useEffect(() => {
    timeRef.current = 0;
  }, [isPlaying]);

  return (
    <group>
      {/* Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.8} />
      </mesh>
      {/* Orbit path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
        <meshBasicMaterial color="#444" side={THREE.DoubleSide} />
      </mesh>
      {/* Planet */}
      <mesh ref={planetRef} position={[radius, 0, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#4488ff" emissive="#4488ff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Wave simulation
function WaveSimulation({ amplitude, wavelength, frequency, isPlaying }: { amplitude: number; wavelength: number; frequency: number; isPlaying: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const resolution = 100;
  
  const positions = useMemo(() => {
    return new Float32Array(resolution * 3);
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    
    if (isPlaying) {
      timeRef.current += delta;
    }
    
    const geometry = meshRef.current.geometry as THREE.BufferGeometry;
    const posAttr = geometry.getAttribute('position');
    
    for (let i = 0; i < resolution; i++) {
      const x = (i / resolution) * 10 - 5;
      const k = (2 * Math.PI) / wavelength;
      const omega = 2 * Math.PI * frequency;
      const y = amplitude * Math.sin(k * x - omega * timeRef.current);
      
      posAttr.setXYZ(i, x, y, 0);
    }
    posAttr.needsUpdate = true;
  });

  useEffect(() => {
    if (!isPlaying) {
      timeRef.current = 0;
    }
  }, [isPlaying]);

  // Initialize positions
  const initialPositions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < resolution; i++) {
      const x = (i / resolution) * 10 - 5;
      pos.push(x, 0, 0);
    }
    return new Float32Array(pos);
  }, []);

  return (
    <group>
      {/* Wave line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={resolution}
            array={initialPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" linewidth={3} />
      </line>
      {/* Invisible mesh for ref */}
      <mesh ref={meshRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={resolution}
            array={initialPositions}
            itemSize={3}
          />
        </bufferGeometry>
      </mesh>
      {/* Wave particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <WaveParticle 
          key={i} 
          x={(i / 20) * 10 - 5} 
          amplitude={amplitude} 
          wavelength={wavelength} 
          frequency={frequency} 
          isPlaying={isPlaying}
          timeRef={timeRef}
        />
      ))}
    </group>
  );
}

function WaveParticle({ x, amplitude, wavelength, frequency, isPlaying, timeRef }: { 
  x: number; amplitude: number; wavelength: number; frequency: number; isPlaying: boolean; timeRef: React.MutableRefObject<number> 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!meshRef.current) return;
    const k = (2 * Math.PI) / wavelength;
    const omega = 2 * Math.PI * frequency;
    const y = amplitude * Math.sin(k * x - omega * timeRef.current);
    meshRef.current.position.y = y;
  });

  return (
    <mesh ref={meshRef} position={[x, 0, 0]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
    </mesh>
  );
}

// Electric field visualization
function ElectricField({ charge1, charge2, distance, isPlaying }: { charge1: number; charge2: number; distance: number; isPlaying: boolean }) {
  const linesRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying) {
      timeRef.current += delta;
    }
  });

  // Generate field lines
  const fieldLines = useMemo(() => {
    const lines: { start: THREE.Vector3; points: THREE.Vector3[] }[] = [];
    const numLines = 8;
    const pos1 = new THREE.Vector3(-distance / 2, 0, 0);
    const pos2 = new THREE.Vector3(distance / 2, 0, 0);
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      const startOffset = new THREE.Vector3(
        Math.cos(angle) * 0.3,
        Math.sin(angle) * 0.3,
        0
      );
      
      const points: THREE.Vector3[] = [];
      let pos = pos1.clone().add(startOffset);
      
      // Trace field line
      for (let step = 0; step < 50; step++) {
        points.push(pos.clone());
        
        // Calculate field at this point
        const r1 = pos.clone().sub(pos1);
        const r2 = pos.clone().sub(pos2);
        const d1 = r1.length();
        const d2 = r2.length();
        
        if (d1 < 0.2 || d2 < 0.2) break;
        if (pos.length() > 5) break;
        
        const E1 = r1.normalize().multiplyScalar(charge1 / (d1 * d1));
        const E2 = r2.normalize().multiplyScalar(charge2 / (d2 * d2));
        const E = E1.add(E2).normalize().multiplyScalar(0.15);
        
        pos = pos.add(E);
      }
      
      lines.push({ start: pos1.clone().add(startOffset), points });
    }
    
    return lines;
  }, [charge1, charge2, distance]);

  const charge1Color = charge1 > 0 ? '#ff4444' : '#4444ff';
  const charge2Color = charge2 > 0 ? '#ff4444' : '#4444ff';

  return (
    <group ref={linesRef}>
      {/* Charge 1 */}
      <mesh position={[-distance / 2, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={charge1Color} emissive={charge1Color} emissiveIntensity={0.5} />
      </mesh>
      {/* Charge 2 */}
      <mesh position={[distance / 2, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={charge2Color} emissive={charge2Color} emissiveIntensity={0.5} />
      </mesh>
      {/* Field lines */}
      {fieldLines.map((line, idx) => (
        <primitive 
          key={idx}
          object={new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(line.points),
            new THREE.LineBasicMaterial({ color: '#ffaa00', opacity: 0.7, transparent: true })
          )}
        />
      ))}
      {/* Equipotential circles */}
      {[1, 2, 3].map((r) => (
        <group key={`eq1-${r}`}>
          <mesh position={[-distance / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r * 0.5 - 0.02, r * 0.5 + 0.02, 32]} />
            <meshBasicMaterial color="#00ff88" opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[distance / 2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r * 0.5 - 0.02, r * 0.5 + 0.02, 32]} />
            <meshBasicMaterial color="#00ff88" opacity={0.3} transparent side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Magnetic field visualization
function MagneticField({ current, wireLength, isPlaying }: { current: number; wireLength: number; isPlaying: boolean }) {
  const timeRef = useRef(0);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isPlaying || !particlesRef.current) return;
    timeRef.current += delta;
    
    // Animate particles along field lines
    particlesRef.current.children.forEach((child, idx) => {
      if (child instanceof THREE.Mesh) {
        const baseAngle = (idx / 16) * Math.PI * 2;
        const radius = 1 + (idx % 3) * 0.5;
        const speed = current > 0 ? 1 : -1;
        const angle = baseAngle + timeRef.current * speed;
        child.position.x = Math.cos(angle) * radius;
        child.position.z = Math.sin(angle) * radius;
      }
    });
  });

  useEffect(() => {
    timeRef.current = 0;
  }, [isPlaying]);

  const fieldStrength = Math.abs(current);
  const direction = current > 0 ? 1 : -1;

  return (
    <group>
      {/* Current-carrying wire */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, wireLength, 16]} />
        <meshStandardMaterial color="#cc8800" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Current direction arrow */}
      <mesh position={[0, wireLength / 2 + 0.2, 0]} rotation={[0, 0, direction > 0 ? 0 : Math.PI]}>
        <coneGeometry args={[0.15, 0.3, 16]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.3} />
      </mesh>
      
      {/* Magnetic field circles (B-field) */}
      {[1, 1.5, 2, 2.5].map((radius, i) => (
        <group key={`bfield-${i}`}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wireLength / 4, 0]}>
            <torusGeometry args={[radius, 0.02, 8, 64]} />
            <meshStandardMaterial color="#8844ff" emissive="#8844ff" emissiveIntensity={0.3} opacity={0.6} transparent />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -wireLength / 4, 0]}>
            <torusGeometry args={[radius, 0.02, 8, 64]} />
            <meshStandardMaterial color="#8844ff" emissive="#8844ff" emissiveIntensity={0.3} opacity={0.6} transparent />
          </mesh>
          {/* Direction arrows on field lines */}
          {[0, 1, 2, 3].map((j) => {
            const angle = (j / 4) * Math.PI * 2 + (direction > 0 ? 0.2 : -0.2);
            return (
              <mesh 
                key={`arrow-${i}-${j}`}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                rotation={[0, -angle + (direction > 0 ? Math.PI / 2 : -Math.PI / 2), 0]}
              >
                <coneGeometry args={[0.08, 0.2, 8]} />
                <meshStandardMaterial color="#8844ff" emissive="#8844ff" emissiveIntensity={0.5} />
              </mesh>
            );
          })}
        </group>
      ))}
      
      {/* Animated particles */}
      <group ref={particlesRef}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={`particle-${i}`} position={[1, (i % 4 - 1.5) * 0.5, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#ff66ff" emissive="#ff66ff" emissiveIntensity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Scene wrapper
function PhysicsScene({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Grid 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#1a3a4a" 
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#2a5a6a"
        fadeDistance={30}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />
      {children}
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  );
}

export function Physics3DCalculator() {
  const [simulation, setSimulation] = useState<'projectile' | 'pendulum' | 'spring' | 'orbit' | 'wave' | 'electric' | 'magnetic'>('projectile');
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState<string>('');
  
  // Projectile params
  const [velocity, setVelocity] = useState('15');
  const [angle, setAngle] = useState('45');
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0, t: 0 });
  
  // Pendulum params
  const [pendulumLength, setPendulumLength] = useState('2');
  const [pendulumAngle, setPendulumAngle] = useState('30');
  
  // Spring params
  const [springK, setSpringK] = useState('10');
  const [springMass, setSpringMass] = useState('1');
  const [springAmplitude, setSpringAmplitude] = useState('1');
  
  // Orbit params
  const [orbitRadius, setOrbitRadius] = useState('3');
  const [orbitPeriod, setOrbitPeriod] = useState('5');

  // Wave params
  const [waveAmplitude, setWaveAmplitude] = useState('1');
  const [waveWavelength, setWaveWavelength] = useState('2');
  const [waveFrequency, setWaveFrequency] = useState('0.5');

  // Electric field params
  const [charge1, setCharge1] = useState('1');
  const [charge2, setCharge2] = useState('-1');
  const [chargeDistance, setChargeDistance] = useState('4');

  // Magnetic field params
  const [wireCurrent, setWireCurrent] = useState('5');
  const [wireLength, setWireLength] = useState('4');

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentPos({ x: 0, y: 0, t: 0 });
    setResult('');
  };

  const calculateProjectile = () => {
    const v0 = parseFloat(velocity);
    const ang = parseFloat(angle);
    const angleRad = (ang * Math.PI) / 180;
    
    const maxHeight = (v0 * v0 * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * GRAVITY);
    const range = (v0 * v0 * Math.sin(2 * angleRad)) / GRAVITY;
    const timeOfFlight = (2 * v0 * Math.sin(angleRad)) / GRAVITY;
    
    setResult(`Projectile Motion Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Velocity: ${v0} m/s at ${ang}°
Vx = ${(v0 * Math.cos(angleRad)).toFixed(2)} m/s
Vy = ${(v0 * Math.sin(angleRad)).toFixed(2)} m/s

▸ Maximum Height: ${maxHeight.toFixed(2)} m
▸ Horizontal Range: ${range.toFixed(2)} m
▸ Time of Flight: ${timeOfFlight.toFixed(2)} s

Equations:
  x(t) = v₀·cos(θ)·t
  y(t) = v₀·sin(θ)·t - ½gt²`);
  };

  const calculatePendulum = () => {
    const L = parseFloat(pendulumLength);
    const theta = parseFloat(pendulumAngle);
    
    const period = 2 * Math.PI * Math.sqrt(L / GRAVITY);
    const frequency = 1 / period;
    const maxVelocity = Math.sqrt(2 * GRAVITY * L * (1 - Math.cos((theta * Math.PI) / 180)));
    
    setResult(`Simple Pendulum Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Length: ${L} m
Initial Angle: ${theta}°

▸ Period: ${period.toFixed(3)} s
▸ Frequency: ${frequency.toFixed(3)} Hz
▸ Angular Frequency: ${(2 * Math.PI * frequency).toFixed(3)} rad/s
▸ Max Velocity: ${maxVelocity.toFixed(3)} m/s

Equations:
  T = 2π√(L/g)
  θ(t) = θ₀·cos(ωt)
  ω = √(g/L)`);
  };

  const calculateSpring = () => {
    const k = parseFloat(springK);
    const m = parseFloat(springMass);
    const A = parseFloat(springAmplitude);
    
    const omega = Math.sqrt(k / m);
    const period = (2 * Math.PI) / omega;
    const frequency = 1 / period;
    const maxVelocity = omega * A;
    const maxAcceleration = omega * omega * A;
    
    setResult(`Spring Oscillator Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Spring Constant: ${k} N/m
Mass: ${m} kg
Amplitude: ${A} m

▸ Angular Frequency: ${omega.toFixed(3)} rad/s
▸ Period: ${period.toFixed(3)} s
▸ Frequency: ${frequency.toFixed(3)} Hz
▸ Max Velocity: ${maxVelocity.toFixed(3)} m/s
▸ Max Acceleration: ${maxAcceleration.toFixed(3)} m/s²

Equations:
  ω = √(k/m)
  x(t) = A·cos(ωt)
  v(t) = -Aω·sin(ωt)`);
  };

  const calculateOrbit = () => {
    const r = parseFloat(orbitRadius);
    const T = parseFloat(orbitPeriod);
    
    const omega = (2 * Math.PI) / T;
    const velocity = omega * r;
    const centripetalAccel = omega * omega * r;
    
    setResult(`Orbital Motion Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Orbital Radius: ${r} units
Period: ${T} s

▸ Angular Velocity: ${omega.toFixed(3)} rad/s
▸ Orbital Velocity: ${velocity.toFixed(3)} units/s
▸ Centripetal Acceleration: ${centripetalAccel.toFixed(3)} units/s²

Equations:
  ω = 2π/T
  v = ωr
  a = ω²r = v²/r

Kepler's 3rd Law:
  T² ∝ r³`);
  };

  const calculateWave = () => {
    const A = parseFloat(waveAmplitude);
    const lambda = parseFloat(waveWavelength);
    const f = parseFloat(waveFrequency);
    
    const v = lambda * f;
    const k = (2 * Math.PI) / lambda;
    const omega = 2 * Math.PI * f;
    const T = 1 / f;
    
    setResult(`Wave Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Amplitude: ${A} m
Wavelength: ${lambda} m
Frequency: ${f} Hz

▸ Wave Speed: ${v.toFixed(3)} m/s
▸ Period: ${T.toFixed(3)} s
▸ Wave Number (k): ${k.toFixed(3)} rad/m
▸ Angular Frequency (ω): ${omega.toFixed(3)} rad/s

Wave Equation:
  y(x,t) = A·sin(kx - ωt)
  y(x,t) = ${A}·sin(${k.toFixed(2)}x - ${omega.toFixed(2)}t)

Relations:
  v = λf = ω/k
  T = 1/f = 2π/ω`);
  };

  const calculateElectricField = () => {
    const q1 = parseFloat(charge1);
    const q2 = parseFloat(charge2);
    const d = parseFloat(chargeDistance);
    const k = 8.99e9; // Coulomb's constant
    
    const force = (k * Math.abs(q1 * q2)) / (d * d);
    const midpointField = k * Math.abs(q1) / ((d/2) ** 2) + k * Math.abs(q2) / ((d/2) ** 2);
    const potential = k * q1 / (d/2) + k * q2 / (d/2);
    
    setResult(`Electric Field Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Charge 1: ${q1 > 0 ? '+' : ''}${q1} C (${q1 > 0 ? 'positive' : 'negative'})
Charge 2: ${q2 > 0 ? '+' : ''}${q2} C (${q2 > 0 ? 'positive' : 'negative'})
Distance: ${d} m

▸ Coulomb Force: ${force.toExponential(3)} N
▸ Force Type: ${q1 * q2 > 0 ? 'Repulsive' : 'Attractive'}

Field at Midpoint:
▸ |E| ≈ ${midpointField.toExponential(3)} N/C

Equations:
  F = k·q₁·q₂/r²
  E = k·q/r²
  V = k·q/r

Coulomb's Constant:
  k = 8.99 × 10⁹ N·m²/C²`);
  };

  const calculateMagneticField = () => {
    const I = parseFloat(wireCurrent);
    const L = parseFloat(wireLength);
    const mu0 = 4 * Math.PI * 1e-7; // Permeability of free space
    
    const r1 = 0.1; // 10 cm from wire
    const B1 = (mu0 * Math.abs(I)) / (2 * Math.PI * r1);
    
    const r2 = 0.5; // 50 cm from wire
    const B2 = (mu0 * Math.abs(I)) / (2 * Math.PI * r2);
    
    setResult(`Magnetic Field Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current: ${I} A (${I > 0 ? 'upward' : 'downward'})
Wire Length: ${L} m

▸ B at r=10cm: ${B1.toExponential(3)} T
▸ B at r=50cm: ${B2.toExponential(3)} T

Field Direction: ${I > 0 ? 'Counter-clockwise' : 'Clockwise'} (view from above)

Equations:
  B = μ₀I/(2πr)  (infinite wire)

Right-Hand Rule:
  Thumb → Current direction
  Fingers → Magnetic field direction

Constants:
  μ₀ = 4π × 10⁻⁷ T·m/A`);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Box className="h-4 w-4 text-primary" />
        <span>3D Physics Simulations with real-time calculations</span>
      </div>

      <Tabs value={simulation} onValueChange={(v) => { setSimulation(v as any); handleReset(); }}>
        <TabsList className="grid w-full grid-cols-7 h-auto">
          <TabsTrigger value="projectile" className="text-xs py-2">Projectile</TabsTrigger>
          <TabsTrigger value="pendulum" className="text-xs py-2">Pendulum</TabsTrigger>
          <TabsTrigger value="spring" className="text-xs py-2">Spring</TabsTrigger>
          <TabsTrigger value="orbit" className="text-xs py-2">Orbit</TabsTrigger>
          <TabsTrigger value="wave" className="text-xs py-2">Wave</TabsTrigger>
          <TabsTrigger value="electric" className="text-xs py-2">E-Field</TabsTrigger>
          <TabsTrigger value="magnetic" className="text-xs py-2">B-Field</TabsTrigger>
        </TabsList>

        {/* 3D Canvas */}
        <div className="glass-panel mt-4 rounded-xl overflow-hidden" style={{ height: '300px' }}>
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <PhysicsScene>
              {simulation === 'projectile' && (
                <AnimatedProjectile 
                  v0={parseFloat(velocity)} 
                  angle={parseFloat(angle)} 
                  isPlaying={isPlaying}
                  onPositionUpdate={(x, y, t) => setCurrentPos({ x, y, t })}
                  onComplete={() => setIsPlaying(false)}
                />
              )}
              {simulation === 'pendulum' && (
                <Pendulum 
                  length={parseFloat(pendulumLength)} 
                  angle={parseFloat(pendulumAngle)}
                  isPlaying={isPlaying}
                />
              )}
              {simulation === 'spring' && (
                <SpringOscillator 
                  k={parseFloat(springK)}
                  mass={parseFloat(springMass)}
                  amplitude={parseFloat(springAmplitude)}
                  isPlaying={isPlaying}
                />
              )}
              {simulation === 'orbit' && (
                <OrbitalMotion 
                  radius={parseFloat(orbitRadius)}
                  period={parseFloat(orbitPeriod)}
                  isPlaying={isPlaying}
                />
              )}
              {simulation === 'wave' && (
                <WaveSimulation 
                  amplitude={parseFloat(waveAmplitude)}
                  wavelength={parseFloat(waveWavelength)}
                  frequency={parseFloat(waveFrequency)}
                  isPlaying={isPlaying}
                />
              )}
              {simulation === 'electric' && (
                <ElectricField 
                  charge1={parseFloat(charge1)}
                  charge2={parseFloat(charge2)}
                  distance={parseFloat(chargeDistance)}
                  isPlaying={isPlaying}
                />
              )}
              {simulation === 'magnetic' && (
                <MagneticField 
                  current={parseFloat(wireCurrent)}
                  wireLength={parseFloat(wireLength)}
                  isPlaying={isPlaying}
                />
              )}
            </PhysicsScene>
          </Canvas>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => setIsPlaying(!isPlaying)} 
            variant={isPlaying ? "destructive" : "default"}
            className="flex-1"
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <TabsContent value="projectile" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Initial Velocity (m/s)</label>
              <Input value={velocity} onChange={(e) => setVelocity(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Launch Angle (°)</label>
              <Input value={angle} onChange={(e) => setAngle(e.target.value)} className="font-mono" />
            </div>
          </div>
          {isPlaying && (
            <div className="glass-panel p-3 text-xs font-mono">
              t = {currentPos.t.toFixed(2)}s | x = {currentPos.x.toFixed(2)}m | y = {currentPos.y.toFixed(2)}m
            </div>
          )}
          <Button onClick={calculateProjectile} className="w-full">Calculate Trajectory</Button>
        </TabsContent>

        <TabsContent value="pendulum" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Length (m)</label>
              <Input value={pendulumLength} onChange={(e) => setPendulumLength(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Initial Angle (°)</label>
              <Input value={pendulumAngle} onChange={(e) => setPendulumAngle(e.target.value)} className="font-mono" />
            </div>
          </div>
          <Button onClick={calculatePendulum} className="w-full">Calculate Period</Button>
        </TabsContent>

        <TabsContent value="spring" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Spring Constant (N/m)</label>
              <Input value={springK} onChange={(e) => setSpringK(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mass (kg)</label>
              <Input value={springMass} onChange={(e) => setSpringMass(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amplitude (m)</label>
              <Input value={springAmplitude} onChange={(e) => setSpringAmplitude(e.target.value)} className="font-mono" />
            </div>
          </div>
          <Button onClick={calculateSpring} className="w-full">Calculate Oscillation</Button>
        </TabsContent>

        <TabsContent value="orbit" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Orbital Radius</label>
              <Input value={orbitRadius} onChange={(e) => setOrbitRadius(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Period (s)</label>
              <Input value={orbitPeriod} onChange={(e) => setOrbitPeriod(e.target.value)} className="font-mono" />
            </div>
          </div>
          <Button onClick={calculateOrbit} className="w-full">Calculate Orbit</Button>
        </TabsContent>

        <TabsContent value="wave" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Amplitude (m)</label>
              <Input value={waveAmplitude} onChange={(e) => setWaveAmplitude(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Wavelength (m)</label>
              <Input value={waveWavelength} onChange={(e) => setWaveWavelength(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Frequency (Hz)</label>
              <Input value={waveFrequency} onChange={(e) => setWaveFrequency(e.target.value)} className="font-mono" />
            </div>
          </div>
          <Button onClick={calculateWave} className="w-full">Calculate Wave Properties</Button>
        </TabsContent>

        <TabsContent value="electric" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Charge 1 (C)</label>
              <Input value={charge1} onChange={(e) => setCharge1(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Charge 2 (C)</label>
              <Input value={charge2} onChange={(e) => setCharge2(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Distance (m)</label>
              <Input value={chargeDistance} onChange={(e) => setChargeDistance(e.target.value)} className="font-mono" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Red = positive charge, Blue = negative charge</p>
          <Button onClick={calculateElectricField} className="w-full">Calculate Electric Field</Button>
        </TabsContent>

        <TabsContent value="magnetic" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Current (A)</label>
              <Input value={wireCurrent} onChange={(e) => setWireCurrent(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Wire Length (m)</label>
              <Input value={wireLength} onChange={(e) => setWireLength(e.target.value)} className="font-mono" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Purple rings = magnetic field (B). Arrow indicates current direction.</p>
          <Button onClick={calculateMagneticField} className="w-full">Calculate Magnetic Field</Button>
        </TabsContent>
      </Tabs>

      {result && (
        <pre className="glass-panel p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
