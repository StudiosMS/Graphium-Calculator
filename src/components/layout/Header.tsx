import { Calculator, Github, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center glow-primary">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">graphium</h1>
            <p className="text-xs text-muted-foreground">Advanced Calculator Suite</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Powered by math.js</span>
            <span className="text-border">•</span>
            <a
              href="https://github.com/ShubhaRijal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              <span>About</span>
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            asChild
          >
            <a
              href="https://github.com/ShubhaRijal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
