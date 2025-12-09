import { cn } from '@/lib/utils';
import { 
  Calculator, 
  LineChart, 
  Sigma, 
  BarChart3, 
  Scale, 
  AlertCircle,
  Grid3X3,
  GitBranch,
  Atom,
  Equal,
  Binary,
  Zap,
  BookOpen,
  Box
} from 'lucide-react';

export type CalculatorMode = 
  | 'scientific' 
  | 'graphing' 
  | 'calculus' 
  | 'statistics' 
  | 'units' 
  | 'errors'
  | 'matrix'
  | 'piecewise'
  | 'complex'
  | 'equations'
  | 'base'
  | 'physics'
  | 'physics3d';

interface NavigationProps {
  activeMode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}

const modes = [
  { id: 'scientific', label: 'Scientific', icon: Calculator, description: 'Basic & advanced calculations' },
  { id: 'graphing', label: 'Graphing', icon: LineChart, description: '2D function plotting' },
  { id: 'piecewise', label: 'Piecewise', icon: GitBranch, description: 'Piecewise & constraints' },
  { id: 'calculus', label: 'Calculus', icon: Sigma, description: 'Derivatives, integrals, limits' },
  { id: 'matrix', label: 'Matrix', icon: Grid3X3, description: 'Matrix operations' },
  { id: 'equations', label: 'Equations', icon: Equal, description: 'Solve equations' },
  { id: 'complex', label: 'Complex', icon: Atom, description: 'Complex numbers' },
  { id: 'statistics', label: 'Statistics', icon: BarChart3, description: 'Data analysis & regression' },
  { id: 'physics', label: 'Physics', icon: Zap, description: 'Physics formulas' },
  { id: 'physics3d', label: '3D Physics', icon: Box, description: '3D simulations' },
  { id: 'units', label: 'Units', icon: Scale, description: 'Unit conversion' },
  { id: 'base', label: 'Base Conv.', icon: Binary, description: 'Number base converter' },
  { id: 'errors', label: 'Error Check', icon: AlertCircle, description: 'Expression validation' },
] as const;

export function Navigation({ activeMode, onModeChange }: NavigationProps) {
  return (
    <nav className="overflow-x-auto scrollbar-thin pb-2">
      <div className="flex gap-2 min-w-max">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id as CalculatorMode)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200',
                'border border-transparent',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary/50 shadow-lg shadow-primary/20'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:border-border'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium text-xs whitespace-nowrap">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function NavigationVertical({ activeMode, onModeChange }: NavigationProps) {
  return (
    <nav className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
        Calculator Modes
      </div>
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id as CalculatorMode)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-sm">{mode.label}</div>
              <div className={cn(
                'text-xs truncate',
                isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                {mode.description}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
