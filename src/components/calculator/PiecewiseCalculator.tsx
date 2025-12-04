import { useState, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateGraphPoints, checkExpression } from '@/lib/mathEngine';
import { Plus, Trash2, GitBranch } from 'lucide-react';

interface PiecewiseSegment {
  id: string;
  expression: string;
  condition: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'between';
  value1: string;
  value2: string;
  color: string;
}

const COLORS = ['#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#eab308', '#22c55e'];

const conditionLabels: Record<string, string> = {
  lt: 'x <',
  lte: 'x ≤',
  gt: 'x >',
  gte: 'x ≥',
  eq: 'x =',
  between: '< x <',
};

export function PiecewiseCalculator() {
  const [segments, setSegments] = useState<PiecewiseSegment[]>([
    { id: '1', expression: 'x^2', condition: 'lt', value1: '0', value2: '', color: COLORS[0] },
    { id: '2', expression: '2*x', condition: 'gte', value1: '0', value2: '', color: COLORS[1] },
  ]);
  const [xRange, setXRange] = useState({ min: -10, max: 10 });
  const [yRange, setYRange] = useState({ min: -10, max: 10 });

  const addSegment = useCallback(() => {
    const newId = String(Date.now());
    const colorIndex = segments.length % COLORS.length;
    setSegments(prev => [
      ...prev,
      { id: newId, expression: '', condition: 'gt', value1: '0', value2: '', color: COLORS[colorIndex] }
    ]);
  }, [segments.length]);

  const updateSegment = useCallback((id: string, field: keyof PiecewiseSegment, value: string) => {
    setSegments(prev =>
      prev.map(seg => (seg.id === id ? { ...seg, [field]: value } : seg))
    );
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(seg => seg.id !== id));
  }, []);

  const evaluateCondition = useCallback((x: number, segment: PiecewiseSegment): boolean => {
    const v1 = parseFloat(segment.value1);
    const v2 = parseFloat(segment.value2);
    
    switch (segment.condition) {
      case 'lt': return x < v1;
      case 'lte': return x <= v1;
      case 'gt': return x > v1;
      case 'gte': return x >= v1;
      case 'eq': return Math.abs(x - v1) < 0.01;
      case 'between': return x > v1 && x < v2;
      default: return false;
    }
  }, []);

  const graphData = useMemo(() => {
    const data: { x: number; [key: string]: number | null }[] = [];
    const numPoints = 500;
    const step = (xRange.max - xRange.min) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const x = xRange.min + i * step;
      const point: { x: number; [key: string]: number | null } = { x };
      
      segments.forEach(segment => {
        if (segment.expression.trim() && evaluateCondition(x, segment)) {
          const points = generateGraphPoints(segment.expression, x - step / 2, x + step / 2, 1);
          const y = points[0]?.y;
          point[segment.id] = (y !== undefined && isFinite(y) && y >= yRange.min && y <= yRange.max) ? y : null;
        } else {
          point[segment.id] = null;
        }
      });
      
      data.push(point);
    }
    
    return data;
  }, [segments, xRange, yRange, evaluateCondition]);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <GitBranch className="h-4 w-4 text-primary" />
        <span>Define piecewise functions with domain constraints</span>
      </div>

      {/* Graph */}
      <div className="glass-panel p-4">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--graph-grid))" />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={[xRange.min, xRange.max]}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <YAxis 
              type="number" 
              domain={[yRange.min, yRange.max]}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            {segments.map(segment => (
              <Line
                key={segment.id}
                type="monotone"
                dataKey={segment.id}
                stroke={segment.color}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Piecewise Segments */}
      <div className="space-y-3">
        {segments.map((segment, index) => {
          const check = checkExpression(segment.expression);
          return (
            <div key={segment.id} className="glass-panel p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium">Piece {index + 1}</span>
                </div>
                {segments.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSegment(segment.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Expression */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">f(x) =</label>
                  <Input
                    value={segment.expression}
                    onChange={(e) => updateSegment(segment.id, 'expression', e.target.value)}
                    placeholder="e.g., x^2"
                    className={`font-mono ${!check.valid && segment.expression ? 'border-destructive' : ''}`}
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Domain</label>
                  <div className="flex gap-2">
                    {segment.condition === 'between' && (
                      <Input
                        value={segment.value1}
                        onChange={(e) => updateSegment(segment.id, 'value1', e.target.value)}
                        className="w-16 font-mono"
                        placeholder="a"
                      />
                    )}
                    <Select
                      value={segment.condition}
                      onValueChange={(v) => updateSegment(segment.id, 'condition', v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lt">x &lt;</SelectItem>
                        <SelectItem value="lte">x ≤</SelectItem>
                        <SelectItem value="gt">x &gt;</SelectItem>
                        <SelectItem value="gte">x ≥</SelectItem>
                        <SelectItem value="eq">x =</SelectItem>
                        <SelectItem value="between">a &lt; x &lt; b</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={segment.condition === 'between' ? segment.value2 : segment.value1}
                      onChange={(e) => updateSegment(
                        segment.id,
                        segment.condition === 'between' ? 'value2' : 'value1',
                        e.target.value
                      )}
                      className="w-20 font-mono"
                      placeholder="value"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={addSegment} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Add Piece
      </Button>

      {/* Range Controls */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-3">Graph Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">X Range</label>
            <div className="flex gap-2 items-center mt-1">
              <Input
                type="number"
                value={xRange.min}
                onChange={(e) => setXRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-20 font-mono"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={xRange.max}
                onChange={(e) => setXRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-20 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Y Range</label>
            <div className="flex gap-2 items-center mt-1">
              <Input
                type="number"
                value={yRange.min}
                onChange={(e) => setYRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-20 font-mono"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={yRange.max}
                onChange={(e) => setYRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-20 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-2">Examples</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Absolute value: |x| = x if x ≥ 0, -x if x &lt; 0</li>
          <li>• Step function: 0 if x &lt; 0, 1 if x ≥ 0</li>
          <li>• Heaviside: Define different expressions for each interval</li>
        </ul>
      </div>
    </div>
  );
}
