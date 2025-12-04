import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Binary, ArrowRight, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

type Base = '2' | '8' | '10' | '16';

const baseLabels: Record<Base, string> = {
  '2': 'Binary (Base 2)',
  '8': 'Octal (Base 8)',
  '10': 'Decimal (Base 10)',
  '16': 'Hexadecimal (Base 16)',
};

export function BaseConverter() {
  const [inputValue, setInputValue] = useState('255');
  const [fromBase, setFromBase] = useState<Base>('10');
  const [results, setResults] = useState<Record<Base, string>>({
    '2': '11111111',
    '8': '377',
    '10': '255',
    '16': 'FF',
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedBase, setCopiedBase] = useState<Base | null>(null);

  const convert = useCallback(() => {
    setError(null);
    try {
      // Parse input in the specified base
      const decimal = parseInt(inputValue, parseInt(fromBase));
      
      if (isNaN(decimal)) {
        setError(`Invalid ${baseLabels[fromBase].toLowerCase()} number`);
        return;
      }

      if (decimal < 0) {
        setError('Please enter a non-negative number');
        return;
      }

      setResults({
        '2': decimal.toString(2),
        '8': decimal.toString(8),
        '10': decimal.toString(10),
        '16': decimal.toString(16).toUpperCase(),
      });
    } catch (err: any) {
      setError(err.message || 'Conversion error');
    }
  }, [inputValue, fromBase]);

  const copyToClipboard = useCallback((base: Base) => {
    navigator.clipboard.writeText(results[base]);
    setCopiedBase(base);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedBase(null), 2000);
  }, [results]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') convert();
  }, [convert]);

  // Validate input based on base
  const validateInput = useCallback((value: string, base: Base): boolean => {
    const patterns: Record<Base, RegExp> = {
      '2': /^[01]*$/,
      '8': /^[0-7]*$/,
      '10': /^[0-9]*$/,
      '16': /^[0-9A-Fa-f]*$/,
    };
    return patterns[base].test(value);
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Binary className="h-4 w-4 text-primary" />
        <span>Convert between binary, octal, decimal, and hexadecimal</span>
      </div>

      {/* Input Section */}
      <div className="glass-panel p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto] gap-3 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Value</label>
            <Input
              value={inputValue}
              onChange={(e) => {
                if (validateInput(e.target.value, fromBase) || e.target.value === '') {
                  setInputValue(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              className="font-mono text-lg"
              placeholder="Enter number..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">From Base</label>
            <Select value={fromBase} onValueChange={(v) => {
              setFromBase(v as Base);
              setInputValue('');
            }}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Binary (2)</SelectItem>
                <SelectItem value="8">Octal (8)</SelectItem>
                <SelectItem value="10">Decimal (10)</SelectItem>
                <SelectItem value="16">Hexadecimal (16)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={convert} size="lg" className="h-10">
            <ArrowRight className="h-4 w-4 mr-2" />
            Convert
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['2', '8', '10', '16'] as Base[]).map((base) => (
          <div key={base} className={`glass-panel p-4 ${base === fromBase ? 'border-primary/50' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{baseLabels[base]}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => copyToClipboard(base)}
              >
                {copiedBase === base ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="font-mono text-lg text-primary break-all">
              {base === '16' ? '0x' : base === '2' ? '0b' : base === '8' ? '0o' : ''}
              {results[base]}
            </p>
          </div>
        ))}
      </div>

      {/* Bitwise Operations */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
          <div className="text-muted-foreground">
            <p className="text-foreground mb-1">Binary prefix:</p>
            <p>0b (e.g., 0b1010)</p>
          </div>
          <div className="text-muted-foreground">
            <p className="text-foreground mb-1">Octal prefix:</p>
            <p>0o (e.g., 0o755)</p>
          </div>
          <div className="text-muted-foreground">
            <p className="text-foreground mb-1">Hex prefix:</p>
            <p>0x (e.g., 0xFF)</p>
          </div>
          <div className="text-muted-foreground">
            <p className="text-foreground mb-1">Hex digits:</p>
            <p>0-9, A-F</p>
          </div>
        </div>
      </div>

      {/* Common Values */}
      <div className="glass-panel p-4">
        <h3 className="text-sm font-medium mb-3">Common Values</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: '8-bit max', value: '255' },
            { label: '16-bit max', value: '65535' },
            { label: 'Byte', value: '256' },
            { label: 'KB', value: '1024' },
          ].map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setInputValue(item.value);
                setFromBase('10');
                setTimeout(convert, 0);
              }}
            >
              {item.label}: {item.value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
