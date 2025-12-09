import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, RotateCcw, Box, Orbit } from 'lucide-react';
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
  const [simulation, setSimulation] = useState<'projectile' | 'pendulum' | 'spring' | 'orbit'>('projectile');
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

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Box className="h-4 w-4 text-primary" />
        <span>3D Physics Simulations with real-time calculations</span>
      </div>

      <Tabs value={simulation} onValueChange={(v) => { setSimulation(v as any); handleReset(); }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projectile">Projectile</TabsTrigger>
          <TabsTrigger value="pendulum">Pendulum</TabsTrigger>
          <TabsTrigger value="spring">Spring</TabsTrigger>
          <TabsTrigger value="orbit">Orbit</TabsTrigger>
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
      </Tabs>

      {result && (
        <pre className="glass-panel p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
