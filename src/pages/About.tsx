import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import graphiumLogo from '@/assets/graphium-logo.png';
import { ArrowLeft, Github, Calculator, Sigma, LineChart, Atom, Users, Target, Lightbulb, Rocket } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient circles */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Navigation */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={graphiumLogo} alt="Graphium" className="h-9 w-9" />
            <span className="text-xl font-semibold tracking-tight">Graphium</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Built for Students, by Students</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            The Future of
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Mathematical Computing
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Graphium was born from a simple idea: what if there was a calculator that could handle 
            everything a college student or engineer needs, all in one beautiful, intuitive interface?
          </p>
        </div>
      </section>

      {/* Why We Created Graphium */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why We Built
                <span className="text-primary"> Graphium</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  As engineering students ourselves, we were frustrated by the fragmented landscape 
                  of calculators and math tools. Need to graph a function? Open one app. Solve a 
                  matrix? Open another. Convert units? Yet another tool.
                </p>
                <p>
                  We envisioned a single, powerful platform that combines the best of scientific 
                  calculators, graphing tools, symbolic math engines, and specialized calculators 
                  into one cohesive experience.
                </p>
                <p>
                  <strong className="text-foreground">Graphium is our answer.</strong> A comprehensive 
                  mathematical toolkit designed specifically for students and engineers who demand 
                  more from their tools.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Calculator, label: 'Scientific Computing', desc: '12+ calculator modes' },
                { icon: LineChart, label: 'Advanced Graphing', desc: '2D, 3D, and animated' },
                { icon: Sigma, label: 'Symbolic Math', desc: 'Derivatives, integrals, limits' },
                { icon: Atom, label: 'Physics Engine', desc: 'Built-in formulas' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="glass-panel p-4 hover:border-primary/50 transition-colors"
                >
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
              <div className="p-4 rounded-2xl bg-primary/10 shrink-0">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground text-lg">
                  To democratize advanced mathematical computing by providing every student 
                  and engineer with access to professional-grade tools that are free, beautiful, 
                  and incredibly powerful. We believe great tools shouldn't require expensive 
                  software licenses or years of learning curve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Creators */}
      <section className="relative z-10 container mx-auto px-4 py-16 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-4">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary">Meet the Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">The Creators</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Developer M */}
            <div className="glass-panel p-6 text-center group hover:border-primary/50 transition-all">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-4 ring-primary/10">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">M</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">Developer M</h3>
              <p className="text-primary mb-3">Co-Creator & Developer</p>
              <p className="text-sm text-muted-foreground mb-4">
                Passionate about building tools that make complex mathematics accessible to everyone.
              </p>
              <Button variant="outline" size="sm" disabled className="opacity-50">
                <Github className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
            
            {/* Developer S */}
            <div className="glass-panel p-6 text-center group hover:border-primary/50 transition-all">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-4 ring-primary/10">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">S</span>
              </div>
              <h3 className="text-xl font-semibold mb-1">Developer S</h3>
              <p className="text-primary mb-3">Co-Creator & Developer</p>
              <p className="text-sm text-muted-foreground mb-4">
                Engineering student dedicated to creating elegant solutions for complex computational problems.
              </p>
              <Button variant="outline" size="sm" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors">
                <a href="https://github.com/ShubhaRijal" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Profile
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Lightbulb className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Experience Graphium?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of students and engineers who are already using Graphium 
              to power their calculations.
            </p>
            <Button asChild size="lg" className="glow-primary">
              <Link to="/">
                <Calculator className="h-5 w-5 mr-2" />
                Launch Calculator
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
