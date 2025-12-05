import { motion } from 'framer-motion';
import { Sparkles, Github } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-aurora-gradient opacity-50 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/50">
                <Sparkles className="h-5 w-5 text-aurora-cyan" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gradient">Aurora Vibe Charts</h1>
              <p className="text-xs text-muted-foreground">AI Data & Chart Assistant</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/50 text-muted-foreground transition-colors hover:border-aurora-cyan/50 hover:text-aurora-cyan"
            >
              <Github className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
