import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { evaluate } from '@/lib/mathEngine';
import { Atom, Plus, Minus, X, Divide } from 'lucide-react';

export function ComplexCalculator() {
  const [realA, setRealA] = useState('3');
  const [imagA, setImagA] = useState('4');
  const [realB, setRealB] = useState('1');
  const [imagB, setImagB] = useState('2');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback((operation: string) => {
    setError(null);
    try {
      const a = `complex(${realA}, ${imagA})`;
      const b = `complex(${realB}, ${imagB})`;
      
      let expr = '';
      switch (operation) {
        case 'add':
          expr = `${a} + ${b}`;
          break;
        case 'subtract':
          expr = `${a} - ${b}`;
          break;
        case 'multiply':
          expr = `${a} * ${b}`;
          break;
        case 'divide':
          expr = `${a} / ${b}`;
          break;
        case 'magnitude':
          expr = `abs(${a})`;
          break;
        case 'argument':
          expr = `arg(${a})`;
          break;
        case 'conjugate':
          expr = `conj(${a})`;
          break;
        case 'polar':
          const r = `abs(${a})`;
          const theta = `arg(${a})`;
          const rResult = evaluate(r);
          const thetaResult = evaluate(theta);
          if (!rResult.error && !thetaResult.error) {
            setResult(`r = ${rResult.value}, θ = ${thetaResult.value} rad`);
            return;
          }
          break;
        case 'power':
          expr = `pow(${a}, 2)`;
          break;
        case 'sqrt':
          expr = `sqrt(${a})`;
          break;
        case 'exp':
          expr = `exp(${a})`;
          break;
        case 'log':
          expr = `log(${a})`;
          break;
      }
      
      if (expr) {
        const calcResult = evaluate(expr);
        if (calcResult.error) {
          setError(calcResult.error);
        } else {
          setResult(calcResult.value);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Calculation error');
    }
  }, [realA, imagA, realB, imagB]);

  const evaluateExpression = useCallback(() => {
    setError(null);
    try {
      // Replace i with complex notation for math.js
      let expr = expression
        .replace(/(\d+)\s*\+\s*(\d+)i/g, 'complex($1, $2)')
        .replace(/(\d+)i/g, 'complex(0, $1)')
        .replace(/\bi\b/g, 'complex(0, 1)');
      
      const calcResult = evaluate(expr);
      if (calcResult.error) {
        setError(calcResult.error);
      } else {
        setResult(calcResult.value);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid expression');
    }
  }, [expression]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Atom className="h-4 w-4 text-primary" />
        <span>Complex number arithmetic and operations</span>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="basic">Basic Operations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          {/* Complex Number A */}
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-3">Complex Number A</h3>
            <div className="flex items-center gap-2">
              <Input
                value={realA}
                onChange={(e) => setRealA(e.target.value)}
                className="w-20 font-mono text-center"
                placeholder="real"
              />
              <span className="text-muted-foreground">+</span>
              <Input
                value={imagA}
                onChange={(e) => setImagA(e.target.value)}
                className="w-20 font-mono text-center"
                placeholder="imag"
              />
              <span className="text-primary font-mono">i</span>
            </div>
          </div>

          {/* Complex Number B */}
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-3">Complex Number B</h3>
            <div className="flex items-center gap-2">
              <Input
                value={realB}
                onChange={(e) => setRealB(e.target.value)}
                className="w-20 font-mono text-center"
                placeholder="real"
              />
              <span className="text-muted-foreground">+</span>
              <Input
                value={imagB}
                onChange={(e) => setImagB(e.target.value)}
                className="w-20 font-mono text-center"
                placeholder="imag"
              />
              <span className="text-primary font-mono">i</span>
            </div>
          </div>

          {/* Operations */}
          <div className="grid grid-cols-4 gap-2">
            <Button onClick={() => calculate('add')} variant="outline" className="h-12">
              <Plus className="h-4 w-4 mr-1" /> A+B
            </Button>
            <Button onClick={() => calculate('subtract')} variant="outline" className="h-12">
              <Minus className="h-4 w-4 mr-1" /> A−B
            </Button>
            <Button onClick={() => calculate('multiply')} variant="outline" className="h-12">
              <X className="h-4 w-4 mr-1" /> A×B
            </Button>
            <Button onClick={() => calculate('divide')} variant="outline" className="h-12">
              <Divide className="h-4 w-4 mr-1" /> A÷B
            </Button>
          </div>

          {/* Single Number Operations */}
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-3">Operations on A</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => calculate('magnitude')} variant="secondary" size="sm">|A| Magnitude</Button>
              <Button onClick={() => calculate('argument')} variant="secondary" size="sm">arg(A)</Button>
              <Button onClick={() => calculate('conjugate')} variant="secondary" size="sm">A* Conjugate</Button>
              <Button onClick={() => calculate('polar')} variant="secondary" size="sm">Polar Form</Button>
              <Button onClick={() => calculate('sqrt')} variant="secondary" size="sm">√A</Button>
              <Button onClick={() => calculate('power')} variant="secondary" size="sm">A²</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-3">Expression Evaluator</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Enter complex expressions using standard notation (e.g., "3+4i", "(2+3i)*(1-i)")
            </p>
            <div className="flex gap-2">
              <Input
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g., (3+4i) * (1+2i)"
                className="font-mono flex-1"
                onKeyDown={(e) => e.key === 'Enter' && evaluateExpression()}
              />
              <Button onClick={evaluateExpression}>Evaluate</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => calculate('exp')} variant="secondary">e^A</Button>
            <Button onClick={() => calculate('log')} variant="secondary">ln(A)</Button>
          </div>

          <div className="glass-panel p-4">
            <h3 className="text-sm font-medium mb-2">Complex Number Formulas</h3>
            <ul className="text-xs text-muted-foreground space-y-2 font-mono">
              <li>• |a + bi| = √(a² + b²)</li>
              <li>• arg(a + bi) = atan2(b, a)</li>
              <li>• (a + bi)* = a - bi</li>
              <li>• e^(iθ) = cos(θ) + i·sin(θ)</li>
              <li>• Polar: z = r·e^(iθ) = r(cos θ + i sin θ)</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Result */}
      {(result || error) && (
        <div className={`glass-panel p-4 ${error ? 'border-destructive' : ''}`}>
          <h3 className="text-sm font-medium mb-2">Result</h3>
          {error ? (
            <p className="text-destructive font-mono text-sm">{error}</p>
          ) : (
            <p className="font-mono text-lg text-primary">{result}</p>
          )}
        </div>
      )}
    </div>
  );
}
