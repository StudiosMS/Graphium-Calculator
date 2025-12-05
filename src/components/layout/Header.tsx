import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import graphiumLogo from '@/assets/graphium-logo.png';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={graphiumLogo} alt="Graphium" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Graphium</h1>
            <p className="text-xs text-muted-foreground">Advanced Calculator Suite</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by math.js</span>
            <span className="text-border">•</span>
            <Link
              to="/about"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              About
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            asChild
          >
            <Link to="/about">
              <Github className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
