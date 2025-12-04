import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Atom, Waves } from 'lucide-react';

// Physical constants
const CONSTANTS = {
  c: 299792458, // Speed of light (m/s)
  g: 9.80665, // Gravitational acceleration (m/s²)
  G: 6.67430e-11, // Gravitational constant
  h: 6.62607015e-34, // Planck constant
  hbar: 1.054571817e-34, // Reduced Planck constant
  e: 1.602176634e-19, // Elementary charge
  me: 9.1093837015e-31, // Electron mass
  mp: 1.67262192369e-27, // Proton mass
  k: 1.380649e-23, // Boltzmann constant
  Na: 6.02214076e23, // Avogadro's number
  R: 8.314462618, // Gas constant
  epsilon0: 8.8541878128e-12, // Vacuum permittivity
  mu0: 1.25663706212e-6, // Vacuum permeability
};

type FormulaCategory = 'kinematics' | 'dynamics' | 'energy' | 'waves' | 'electricity';

export function PhysicsCalculator() {
  const [category, setCategory] = useState<FormulaCategory>('kinematics');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Kinematics
  const [v0, setV0] = useState('0');
  const [v, setV] = useState('');
  const [a, setA] = useState('9.8');
  const [t, setT] = useState('5');
  const [s, setS] = useState('');

  // Dynamics
  const [mass, setMass] = useState('10');
  const [force, setForce] = useState('');
  const [acceleration, setAcceleration] = useState('');

  // Energy
  const [height, setHeight] = useState('10');
  const [velocity, setVelocity] = useState('');
  const [kineticE, setKineticE] = useState('');
  const [potentialE, setPotentialE] = useState('');

  // Waves
  const [frequency, setFrequency] = useState('440');
  const [wavelength, setWavelength] = useState('');
  const [waveSpeed, setWaveSpeed] = useState('343');

  // Electricity
  const [voltage, setVoltage] = useState('12');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('100');

  const calculateKinematics = useCallback((formula: string) => {
    setError(null);
    try {
      const v0Num = parseFloat(v0) || 0;
      const aNum = parseFloat(a) || 0;
      const tNum = parseFloat(t) || 0;
      const sNum = parseFloat(s) || 0;
      const vNum = parseFloat(v) || 0;

      let resultVal: number;
      let explanation: string;

      switch (formula) {
        case 'v':
          resultVal = v0Num + aNum * tNum;
          setV(resultVal.toFixed(4));
          explanation = `v = v₀ + at = ${v0Num} + (${aNum})(${tNum}) = ${resultVal.toFixed(4)} m/s`;
          break;
        case 's':
          resultVal = v0Num * tNum + 0.5 * aNum * tNum * tNum;
          setS(resultVal.toFixed(4));
          explanation = `s = v₀t + ½at² = (${v0Num})(${tNum}) + ½(${aNum})(${tNum})² = ${resultVal.toFixed(4)} m`;
          break;
        case 'v2':
          resultVal = Math.sqrt(v0Num * v0Num + 2 * aNum * sNum);
          setV(resultVal.toFixed(4));
          explanation = `v² = v₀² + 2as → v = √(${v0Num}² + 2(${aNum})(${sNum})) = ${resultVal.toFixed(4)} m/s`;
          break;
        case 't':
          resultVal = (vNum - v0Num) / aNum;
          setT(resultVal.toFixed(4));
          explanation = `t = (v - v₀)/a = (${vNum} - ${v0Num})/${aNum} = ${resultVal.toFixed(4)} s`;
          break;
        default:
          return;
      }

      setResult(explanation);
    } catch (err: any) {
      setError(err.message);
    }
  }, [v0, a, t, s, v]);

  const calculateDynamics = useCallback((formula: string) => {
    setError(null);
    try {
      const m = parseFloat(mass) || 0;
      const f = parseFloat(force) || 0;
      const acc = parseFloat(acceleration) || 0;

      let resultVal: number;
      let explanation: string;

      switch (formula) {
        case 'force':
          resultVal = m * acc;
          setForce(resultVal.toFixed(4));
          explanation = `F = ma = (${m})(${acc}) = ${resultVal.toFixed(4)} N`;
          break;
        case 'mass':
          resultVal = f / acc;
          setMass(resultVal.toFixed(4));
          explanation = `m = F/a = ${f}/${acc} = ${resultVal.toFixed(4)} kg`;
          break;
        case 'acceleration':
          resultVal = f / m;
          setAcceleration(resultVal.toFixed(4));
          explanation = `a = F/m = ${f}/${m} = ${resultVal.toFixed(4)} m/s²`;
          break;
        default:
          return;
      }

      setResult(explanation);
    } catch (err: any) {
      setError(err.message);
    }
  }, [mass, force, acceleration]);

  const calculateEnergy = useCallback((formula: string) => {
    setError(null);
    try {
      const m = parseFloat(mass) || 0;
      const h = parseFloat(height) || 0;
      const vel = parseFloat(velocity) || 0;

      let resultVal: number;
      let explanation: string;

      switch (formula) {
        case 'kinetic':
          resultVal = 0.5 * m * vel * vel;
          setKineticE(resultVal.toFixed(4));
          explanation = `KE = ½mv² = ½(${m})(${vel})² = ${resultVal.toFixed(4)} J`;
          break;
        case 'potential':
          resultVal = m * CONSTANTS.g * h;
          setPotentialE(resultVal.toFixed(4));
          explanation = `PE = mgh = (${m})(${CONSTANTS.g.toFixed(2)})(${h}) = ${resultVal.toFixed(4)} J`;
          break;
        case 'velocity':
          resultVal = Math.sqrt(2 * CONSTANTS.g * h);
          setVelocity(resultVal.toFixed(4));
          explanation = `v = √(2gh) = √(2 × ${CONSTANTS.g.toFixed(2)} × ${h}) = ${resultVal.toFixed(4)} m/s`;
          break;
        default:
          return;
      }

      setResult(explanation);
    } catch (err: any) {
      setError(err.message);
    }
  }, [mass, height, velocity]);

  const calculateWaves = useCallback((formula: string) => {
    setError(null);
    try {
      const f = parseFloat(frequency) || 0;
      const λ = parseFloat(wavelength) || 0;
      const v = parseFloat(waveSpeed) || 0;

      let resultVal: number;
      let explanation: string;

      switch (formula) {
        case 'wavelength':
          resultVal = v / f;
          setWavelength(resultVal.toFixed(6));
          explanation = `λ = v/f = ${v}/${f} = ${resultVal.toFixed(6)} m`;
          break;
        case 'frequency':
          resultVal = v / λ;
          setFrequency(resultVal.toFixed(4));
          explanation = `f = v/λ = ${v}/${λ} = ${resultVal.toFixed(4)} Hz`;
          break;
        case 'speed':
          resultVal = f * λ;
          setWaveSpeed(resultVal.toFixed(4));
          explanation = `v = fλ = (${f})(${λ}) = ${resultVal.toFixed(4)} m/s`;
          break;
        default:
          return;
      }

      setResult(explanation);
    } catch (err: any) {
      setError(err.message);
    }
  }, [frequency, wavelength, waveSpeed]);

  const calculateElectricity = useCallback((formula: string) => {
    setError(null);
    try {
      const V = parseFloat(voltage) || 0;
      const I = parseFloat(current) || 0;
      const R = parseFloat(resistance) || 0;

      let resultVal: number;
      let explanation: string;

      switch (formula) {
        case 'current':
          resultVal = V / R;
          setCurrent(resultVal.toFixed(6));
          explanation = `I = V/R = ${V}/${R} = ${resultVal.toFixed(6)} A`;
          break;
        case 'voltage':
          resultVal = I * R;
          setVoltage(resultVal.toFixed(4));
          explanation = `V = IR = (${I})(${R}) = ${resultVal.toFixed(4)} V`;
          break;
        case 'resistance':
          resultVal = V / I;
          setResistance(resultVal.toFixed(4));
          explanation = `R = V/I = ${V}/${I} = ${resultVal.toFixed(4)} Ω`;
          break;
        case 'power':
          const power = V * I;
          explanation = `P = VI = (${V})(${I}) = ${power.toFixed(4)} W`;
          break;
        default:
          return;
      }

      setResult(explanation);
    } catch (err: any) {
      setError(err.message);
    }
  }, [voltage, current, resistance]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4 text-primary" />
        <span>Physics formulas and calculations for engineering</span>
      </div>

      <Tabs defaultValue="kinematics" className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="kinematics" className="text-xs py-2">Kinematics</TabsTrigger>
          <TabsTrigger value="dynamics" className="text-xs py-2">Dynamics</TabsTrigger>
          <TabsTrigger value="energy" className="text-xs py-2">Energy</TabsTrigger>
          <TabsTrigger value="waves" className="text-xs py-2">Waves</TabsTrigger>
          <TabsTrigger value="electricity" className="text-xs py-2">Electricity</TabsTrigger>
        </TabsList>

        {/* Kinematics */}
        <TabsContent value="kinematics" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">v₀ (m/s)</label>
              <Input value={v0} onChange={(e) => setV0(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">v (m/s)</label>
              <Input value={v} onChange={(e) => setV(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">a (m/s²)</label>
              <Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">t (s)</label>
              <Input value={t} onChange={(e) => setT(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">s (m)</label>
              <Input value={s} onChange={(e) => setS(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="secondary" onClick={() => calculateKinematics('v')}>v = v₀ + at</Button>
            <Button variant="secondary" onClick={() => calculateKinematics('s')}>s = v₀t + ½at²</Button>
            <Button variant="secondary" onClick={() => calculateKinematics('v2')}>v² = v₀² + 2as</Button>
            <Button variant="secondary" onClick={() => calculateKinematics('t')}>t = (v-v₀)/a</Button>
          </div>
        </TabsContent>

        {/* Dynamics */}
        <TabsContent value="dynamics" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Mass (kg)</label>
              <Input value={mass} onChange={(e) => setMass(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Force (N)</label>
              <Input value={force} onChange={(e) => setForce(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Accel (m/s²)</label>
              <Input value={acceleration} onChange={(e) => setAcceleration(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => calculateDynamics('force')}>F = ma</Button>
            <Button variant="secondary" onClick={() => calculateDynamics('mass')}>m = F/a</Button>
            <Button variant="secondary" onClick={() => calculateDynamics('acceleration')}>a = F/m</Button>
          </div>
        </TabsContent>

        {/* Energy */}
        <TabsContent value="energy" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Mass (kg)</label>
              <Input value={mass} onChange={(e) => setMass(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Height (m)</label>
              <Input value={height} onChange={(e) => setHeight(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Velocity (m/s)</label>
              <Input value={velocity} onChange={(e) => setVelocity(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">g = {CONSTANTS.g} m/s²</label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => calculateEnergy('kinetic')}>KE = ½mv²</Button>
            <Button variant="secondary" onClick={() => calculateEnergy('potential')}>PE = mgh</Button>
            <Button variant="secondary" onClick={() => calculateEnergy('velocity')}>v = √(2gh)</Button>
          </div>
        </TabsContent>

        {/* Waves */}
        <TabsContent value="waves" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Frequency (Hz)</label>
              <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Wavelength (m)</label>
              <Input value={wavelength} onChange={(e) => setWavelength(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Speed (m/s)</label>
              <Input value={waveSpeed} onChange={(e) => setWaveSpeed(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={() => calculateWaves('wavelength')}>λ = v/f</Button>
            <Button variant="secondary" onClick={() => calculateWaves('frequency')}>f = v/λ</Button>
            <Button variant="secondary" onClick={() => calculateWaves('speed')}>v = fλ</Button>
          </div>
        </TabsContent>

        {/* Electricity */}
        <TabsContent value="electricity" className="space-y-4 mt-4">
          <div className="glass-panel p-4 grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Voltage (V)</label>
              <Input value={voltage} onChange={(e) => setVoltage(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Current (A)</label>
              <Input value={current} onChange={(e) => setCurrent(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Resistance (Ω)</label>
              <Input value={resistance} onChange={(e) => setResistance(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Button variant="secondary" onClick={() => calculateElectricity('current')}>I = V/R</Button>
            <Button variant="secondary" onClick={() => calculateElectricity('voltage')}>V = IR</Button>
            <Button variant="secondary" onClick={() => calculateElectricity('resistance')}>R = V/I</Button>
            <Button variant="secondary" onClick={() => calculateElectricity('power')}>P = VI</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Result */}
      {(result || error) && (
        <div className={`glass-panel p-4 ${error ? 'border-destructive' : ''}`}>
          {error ? (
            <p className="text-destructive font-mono text-sm">{error}</p>
          ) : (
            <p className="font-mono text-primary">{result}</p>
          )}
        </div>
      )}

      {/* Constants Reference */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-2">Physical Constants</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-muted-foreground">
          <span>c = 2.998×10⁸ m/s</span>
          <span>g = 9.807 m/s²</span>
          <span>G = 6.674×10⁻¹¹ N·m²/kg²</span>
          <span>h = 6.626×10⁻³⁴ J·s</span>
          <span>e = 1.602×10⁻¹⁹ C</span>
          <span>Nₐ = 6.022×10²³ /mol</span>
        </div>
      </div>
    </div>
  );
}
