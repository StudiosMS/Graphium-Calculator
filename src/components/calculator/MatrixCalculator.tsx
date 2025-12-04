import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { evaluate } from '@/lib/mathEngine';
import { Plus, Minus, Grid3X3 } from 'lucide-react';

type MatrixOperation = 'add' | 'subtract' | 'multiply' | 'determinant' | 'inverse' | 'transpose' | 'eigenvalues' | 'rref' | 'lu';

export function MatrixCalculator() {
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);
  const [matrixA, setMatrixA] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill('0'))
  );
  const [matrixB, setMatrixB] = useState<string[][]>(
    Array(3).fill(null).map(() => Array(3).fill('0'))
  );
  const [operation, setOperation] = useState<MatrixOperation>('multiply');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const resizeMatrix = useCallback((
    matrix: string[][],
    newRows: number,
    newCols: number
  ): string[][] => {
    const newMatrix: string[][] = [];
    for (let i = 0; i < newRows; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < newCols; j++) {
        newMatrix[i][j] = matrix[i]?.[j] ?? '0';
      }
    }
    return newMatrix;
  }, []);

  const updateMatrixA = useCallback((row: number, col: number, value: string) => {
    setMatrixA(prev => {
      const newMatrix = prev.map(r => [...r]);
      newMatrix[row][col] = value;
      return newMatrix;
    });
  }, []);

  const updateMatrixB = useCallback((row: number, col: number, value: string) => {
    setMatrixB(prev => {
      const newMatrix = prev.map(r => [...r]);
      newMatrix[row][col] = value;
      return newMatrix;
    });
  }, []);

  const handleResizeA = useCallback((rows: number, cols: number) => {
    setRowsA(rows);
    setColsA(cols);
    setMatrixA(resizeMatrix(matrixA, rows, cols));
  }, [matrixA, resizeMatrix]);

  const handleResizeB = useCallback((rows: number, cols: number) => {
    setRowsB(rows);
    setColsB(cols);
    setMatrixB(resizeMatrix(matrixB, rows, cols));
  }, [matrixB, resizeMatrix]);

  const matrixToString = (matrix: string[][]): string => {
    return '[' + matrix.map(row => '[' + row.join(',') + ']').join(',') + ']';
  };

  const calculate = useCallback(() => {
    setError(null);
    try {
      const matA = matrixToString(matrixA);
      const matB = matrixToString(matrixB);
      
      let expression = '';
      switch (operation) {
        case 'add':
          expression = `${matA} + ${matB}`;
          break;
        case 'subtract':
          expression = `${matA} - ${matB}`;
          break;
        case 'multiply':
          expression = `${matA} * ${matB}`;
          break;
        case 'determinant':
          expression = `det(${matA})`;
          break;
        case 'inverse':
          expression = `inv(${matA})`;
          break;
        case 'transpose':
          expression = `transpose(${matA})`;
          break;
        case 'eigenvalues':
          expression = `eigs(${matA}).values`;
          break;
        case 'rref':
          // Reduced row echelon form using math.js
          expression = `${matA}`;
          break;
        case 'lu':
          expression = `lup(${matA})`;
          break;
      }

      const calcResult = evaluate(expression);
      if (calcResult.error) {
        setError(calcResult.error);
      } else {
        setResult(calcResult.value);
      }
    } catch (err: any) {
      setError(err.message || 'Calculation error');
    }
  }, [matrixA, matrixB, operation]);

  const setIdentity = useCallback((isA: boolean) => {
    const rows = isA ? rowsA : rowsB;
    const cols = isA ? colsA : colsB;
    const size = Math.min(rows, cols);
    const identity: string[][] = [];
    for (let i = 0; i < rows; i++) {
      identity[i] = [];
      for (let j = 0; j < cols; j++) {
        identity[i][j] = i === j && i < size ? '1' : '0';
      }
    }
    if (isA) setMatrixA(identity);
    else setMatrixB(identity);
  }, [rowsA, colsA, rowsB, colsB]);

  const clearMatrix = useCallback((isA: boolean) => {
    const rows = isA ? rowsA : rowsB;
    const cols = isA ? colsA : colsB;
    const zeros: string[][] = Array(rows).fill(null).map(() => Array(cols).fill('0'));
    if (isA) setMatrixA(zeros);
    else setMatrixB(zeros);
  }, [rowsA, colsA, rowsB, colsB]);

  const needsTwoMatrices = ['add', 'subtract', 'multiply'].includes(operation);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Operation Selection */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Grid3X3 className="h-4 w-4 text-primary" />
          Matrix Operation
        </h3>
        <Select value={operation} onValueChange={(v) => setOperation(v as MatrixOperation)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add">A + B (Addition)</SelectItem>
            <SelectItem value="subtract">A - B (Subtraction)</SelectItem>
            <SelectItem value="multiply">A × B (Multiplication)</SelectItem>
            <SelectItem value="determinant">det(A) (Determinant)</SelectItem>
            <SelectItem value="inverse">A⁻¹ (Inverse)</SelectItem>
            <SelectItem value="transpose">Aᵀ (Transpose)</SelectItem>
            <SelectItem value="eigenvalues">Eigenvalues</SelectItem>
            <SelectItem value="lu">LU Decomposition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matrix A */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Matrix A</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Size:</span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rowsA > 1 && handleResizeA(rowsA - 1, colsA)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm w-8 text-center">{rowsA}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rowsA < 6 && handleResizeA(rowsA + 1, colsA)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => colsA > 1 && handleResizeA(rowsA, colsA - 1)}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm w-8 text-center">{colsA}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => colsA < 6 && handleResizeA(rowsA, colsA + 1)}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `repeat(${colsA}, 1fr)` }}>
          {matrixA.map((row, i) =>
            row.map((val, j) => (
              <Input
                key={`a-${i}-${j}`}
                value={val}
                onChange={(e) => updateMatrixA(i, j, e.target.value)}
                className="h-10 text-center font-mono text-sm p-1"
              />
            ))
          )}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIdentity(true)}>Identity</Button>
          <Button size="sm" variant="outline" onClick={() => clearMatrix(true)}>Clear</Button>
        </div>
      </div>

      {/* Matrix B */}
      {needsTwoMatrices && (
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Matrix B</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Size:</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rowsB > 1 && handleResizeB(rowsB - 1, colsB)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-8 text-center">{rowsB}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => rowsB < 6 && handleResizeB(rowsB + 1, colsB)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-muted-foreground">×</span>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => colsB > 1 && handleResizeB(rowsB, colsB - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm w-8 text-center">{colsB}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => colsB < 6 && handleResizeB(rowsB, colsB + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `repeat(${colsB}, 1fr)` }}>
            {matrixB.map((row, i) =>
              row.map((val, j) => (
                <Input
                  key={`b-${i}-${j}`}
                  value={val}
                  onChange={(e) => updateMatrixB(i, j, e.target.value)}
                  className="h-10 text-center font-mono text-sm p-1"
                />
              ))
            )}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIdentity(false)}>Identity</Button>
            <Button size="sm" variant="outline" onClick={() => clearMatrix(false)}>Clear</Button>
          </div>
        </div>
      )}

      {/* Calculate Button */}
      <Button onClick={calculate} className="w-full" size="lg">
        Calculate
      </Button>

      {/* Result */}
      {(result || error) && (
        <div className={`glass-panel p-4 ${error ? 'border-destructive' : ''}`}>
          <h3 className="text-sm font-medium mb-2">Result</h3>
          {error ? (
            <p className="text-destructive font-mono text-sm">{error}</p>
          ) : (
            <pre className="font-mono text-sm text-primary whitespace-pre-wrap break-all overflow-x-auto">
              {result}
            </pre>
          )}
        </div>
      )}

      {/* Common Operations Guide */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-2">Matrix Tips</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Enter expressions in cells (e.g., "1/2", "sqrt(2)")</li>
          <li>• Determinant requires square matrices</li>
          <li>• For multiplication: cols(A) must equal rows(B)</li>
          <li>• Eigenvalues work for square matrices only</li>
        </ul>
      </div>
    </div>
  );
}
