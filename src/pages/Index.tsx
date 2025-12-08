import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Navigation, NavigationVertical, type CalculatorMode } from '@/components/layout/Navigation';
import { ScientificCalculator } from '@/components/calculator/ScientificCalculator';
import { GraphingCalculator } from '@/components/calculator/GraphingCalculator';
import { CalculusCalculator } from '@/components/calculator/CalculusCalculator';
import { StatisticsCalculator } from '@/components/calculator/StatisticsCalculator';
import { UnitConverter } from '@/components/calculator/UnitConverter';
import { ErrorChecker } from '@/components/calculator/ErrorChecker';
import { MatrixCalculator } from '@/components/calculator/MatrixCalculator';
import { PiecewiseCalculator } from '@/components/calculator/PiecewiseCalculator';
import { ComplexCalculator } from '@/components/calculator/ComplexCalculator';
import { EquationSolver } from '@/components/calculator/EquationSolver';
import { BaseConverter } from '@/components/calculator/BaseConverter';
import { PhysicsCalculator } from '@/components/calculator/PhysicsCalculator';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [activeMode, setActiveMode] = useState<CalculatorMode>('scientific');
  const isMobile = useIsMobile();

  const renderCalculator = () => {
    switch (activeMode) {
      case 'scientific':
        return <ScientificCalculator />;
      case 'graphing':
        return <GraphingCalculator />;
      case 'piecewise':
        return <PiecewiseCalculator />;
      case 'calculus':
        return <CalculusCalculator />;
      case 'matrix':
        return <MatrixCalculator />;
      case 'equations':
        return <EquationSolver />;
      case 'complex':
        return <ComplexCalculator />;
      case 'statistics':
        return <StatisticsCalculator />;
      case 'physics':
        return <PhysicsCalculator />;
      case 'units':
        return <UnitConverter />;
      case 'base':
        return <BaseConverter />;
      case 'errors':
        return <ErrorChecker />;
      default:
        return <ScientificCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-4">
        {isMobile ? (
          // Mobile Layout - Full height
          <div className="flex flex-col h-full space-y-4">
            <Navigation activeMode={activeMode} onModeChange={setActiveMode} />
            <div className="glass-panel p-4 flex-1 overflow-y-auto">
              {renderCalculator()}
            </div>
          </div>
        ) : (
          // Desktop Layout - Full width with sidebar
          <div className="grid grid-cols-[260px,1fr] gap-6 h-[calc(100vh-8rem)]">
            <aside className="glass-panel p-4 overflow-y-auto sticky top-20">
              <NavigationVertical activeMode={activeMode} onModeChange={setActiveMode} />
            </aside>
            <div className="glass-panel p-6 overflow-y-auto">
              {renderCalculator()}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Graphium Calculator • Built for students</p>
          <span>v1.0.3</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
