import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluate } from '@/lib/mathEngine';
import * as math from 'mathjs';
import { Equal, Calculator } from 'lucide-react';

export function EquationSolver() {
  // Quadratic equation
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('-5');
  const [quadC, setQuadC] = useState('6');
  const [quadResult, setQuadResult] = useState<string>('');

  // System of equations
  const [eq1, setEq1] = useState('2x + 3y = 8');
  const [eq2, setEq2] = useState('x - y = 1');
  const [systemResult, setSystemResult] = useState<string>('');

  // Polynomial roots
  const [polynomial, setPolynomial] = useState('x^3 - 6x^2 + 11x - 6');
  const [polyResult, setPolyResult] = useState<string>('');

  const [error, setError] = useState<string | null>(null);

  const solveQuadratic = useCallback(() => {
    setError(null);
    try {
      const a = parseFloat(quadA);
      const b = parseFloat(quadB);
      const c = parseFloat(quadC);

      if (a === 0) {
        setError('Coefficient "a" cannot be zero for quadratic equation');
        return;
      }

      const discriminant = b * b - 4 * a * c;
      
      let result = '';
      result += `Discriminant (Δ) = ${discriminant.toFixed(4)}\n\n`;

      if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        result += `Two real roots:\n`;
        result += `x₁ = ${x1.toFixed(6)}\n`;
        result += `x₂ = ${x2.toFixed(6)}`;
      } else if (discriminant === 0) {
        const x = -b / (2 * a);
        result += `One repeated root:\n`;
        result += `x = ${x.toFixed(6)}`;
      } else {
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-discriminant) / (2 * a);
        result += `Two complex roots:\n`;
        result += `x₁ = ${realPart.toFixed(6)} + ${imagPart.toFixed(6)}i\n`;
        result += `x₂ = ${realPart.toFixed(6)} - ${imagPart.toFixed(6)}i`;
      }

      setQuadResult(result);
    } catch (err: any) {
      setError(err.message || 'Invalid input');
    }
  }, [quadA, quadB, quadC]);

  const solveSystem = useCallback(() => {
    setError(null);
    try {
      // Parse equations like "2x + 3y = 8"
      const parseEquation = (eq: string): { a: number; b: number; c: number } | null => {
        const match = eq.match(/(-?\d*\.?\d*)x\s*([+-]\s*\d*\.?\d*)y\s*=\s*(-?\d+\.?\d*)/);
        if (!match) return null;
        
        let a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseFloat(match[1]);
        let b = parseFloat(match[2].replace(/\s/g, ''));
        let c = parseFloat(match[3]);
        
        return { a, b, c };
      };

      const parsed1 = parseEquation(eq1);
      const parsed2 = parseEquation(eq2);

      if (!parsed1 || !parsed2) {
        setError('Invalid equation format. Use "ax + by = c"');
        return;
      }

      const { a: a1, b: b1, c: c1 } = parsed1;
      const { a: a2, b: b2, c: c2 } = parsed2;

      const det = a1 * b2 - a2 * b1;

      if (det === 0) {
        setError('System has no unique solution (determinant = 0)');
        return;
      }

      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;

      setSystemResult(`Solution:\nx = ${x.toFixed(6)}\ny = ${y.toFixed(6)}`);
    } catch (err: any) {
      setError(err.message || 'Invalid input');
    }
  }, [eq1, eq2]);

  const findRoots = useCallback(() => {
    setError(null);
    try {
      // Use Newton-Raphson to find roots
      const f = math.compile(polynomial);
      const df = math.derivative(polynomial, 'x');
      const dfCompiled = math.compile(df.toString());

      const roots: number[] = [];
      const tolerance = 1e-10;
      const maxIterations = 100;

      // Try multiple starting points
      for (let start = -10; start <= 10; start += 0.5) {
        let x = start;
        
        for (let i = 0; i < maxIterations; i++) {
          const fx = f.evaluate({ x });
          const dfx = dfCompiled.evaluate({ x });
          
          if (Math.abs(dfx) < 1e-15) break;
          
          const xNew = x - fx / dfx;
          
          if (Math.abs(xNew - x) < tolerance) {
            // Check if this root is already found
            const isNew = !roots.some(r => Math.abs(r - xNew) < 0.0001);
            if (isNew && Math.abs(f.evaluate({ x: xNew })) < 0.0001) {
              roots.push(xNew);
            }
            break;
          }
          x = xNew;
        }
      }

      roots.sort((a, b) => a - b);

      if (roots.length === 0) {
        setPolyResult('No real roots found in range [-10, 10]');
      } else {
        setPolyResult(`Real roots found:\n${roots.map((r, i) => `x${i + 1} = ${r.toFixed(6)}`).join('\n')}`);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid polynomial');
    }
  }, [polynomial]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Equal className="h-4 w-4 text-primary" />
        <span>Solve equations, systems, and find polynomial roots</span>
      </div>

      <Tabs defaultValue="quadratic" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="quadratic">Quadratic</TabsTrigger>
          <TabsTrigger value="system">System 2×2</TabsTrigger>
          <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
        </TabsList>

        {/* Quadratic */}
        <TabsContent value="quadratic" className="space-y-4 mt-4">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-3">ax² + bx + c = 0</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={quadA}
                onChange={(e) => setQuadA(e.target.value)}
                className="w-16 font-mono text-center"
              />
              <span className="text-muted-foreground">x² +</span>
              <Input
                value={quadB}
                onChange={(e) => setQuadB(e.target.value)}
                className="w-16 font-mono text-center"
              />
              <span className="text-muted-foreground">x +</span>
              <Input
                value={quadC}
                onChange={(e) => setQuadC(e.target.value)}
                className="w-16 font-mono text-center"
              />
              <span className="text-muted-foreground">= 0</span>
            </div>
          </div>
          <Button onClick={solveQuadratic} className="w-full">Solve Quadratic</Button>
          {quadResult && (
            <div className="glass-panel p-4">
              <pre className="font-mono text-sm text-primary whitespace-pre-wrap">{quadResult}</pre>
            </div>
          )}
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="space-y-4 mt-4">
          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-sm font-medium">System of Linear Equations</h3>
            <Input
              value={eq1}
              onChange={(e) => setEq1(e.target.value)}
              placeholder="2x + 3y = 8"
              className="font-mono"
            />
            <Input
              value={eq2}
              onChange={(e) => setEq2(e.target.value)}
              placeholder="x - y = 1"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Format: ax + by = c (use - for negative)</p>
          </div>
          <Button onClick={solveSystem} className="w-full">Solve System</Button>
          {systemResult && (
            <div className="glass-panel p-4">
              <pre className="font-mono text-sm text-primary whitespace-pre-wrap">{systemResult}</pre>
            </div>
          )}
        </TabsContent>

        {/* Polynomial */}
        <TabsContent value="polynomial" className="space-y-4 mt-4">
          <div className="glass-panel p-4 space-y-3">
            <h3 className="text-sm font-medium">Find Polynomial Roots</h3>
            <Input
              value={polynomial}
              onChange={(e) => setPolynomial(e.target.value)}
              placeholder="x^3 - 6x^2 + 11x - 6"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Uses Newton-Raphson method to find real roots</p>
          </div>
          <Button onClick={findRoots} className="w-full">Find Roots</Button>
          {polyResult && (
            <div className="glass-panel p-4">
              <pre className="font-mono text-sm text-primary whitespace-pre-wrap">{polyResult}</pre>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="glass-panel p-4 border-destructive">
          <p className="text-destructive font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Formulas Reference */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-2">Formulas</h3>
        <ul className="text-xs text-muted-foreground space-y-1 font-mono">
          <li>• Quadratic: x = (-b ± √(b²-4ac)) / 2a</li>
          <li>• Cramer's Rule: x = |Dx|/|D|, y = |Dy|/|D|</li>
        </ul>
      </div>
    </div>
  );
}
