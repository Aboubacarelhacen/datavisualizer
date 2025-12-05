import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import embed from 'vega-embed';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChartCanvasProps {
  spec: object | null;
  className?: string;
}

export function ChartCanvas({ spec, className }: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !spec) return;

    setIsLoading(true);
    setError(null);

    const renderChart = async () => {
      try {
        // Clear previous chart
        containerRef.current!.innerHTML = '';
        
        await embed(containerRef.current!, spec as any, {
          actions: false,
          theme: 'dark',
          renderer: 'canvas',
          config: {
            background: 'transparent',
          },
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error('Vega embed error:', err);
        setError('Failed to render chart');
        setIsLoading(false);
      }
    };

    renderChart();
  }, [spec]);

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-xl z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <Loader2 className="h-8 w-8 text-aurora-cyan" />
            </motion.div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/50 backdrop-blur-sm rounded-xl z-10"
          >
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {!spec && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6"
          >
            <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center">
              <svg 
                className="h-8 w-8 text-muted-foreground/50"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 17V9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 17V5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 17v-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">No chart selected</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Select a recommended chart or describe what you want to visualize
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: spec ? 1 : 0 }}
        className="w-full h-full flex items-center justify-center [&>div]:w-full"
      />
    </div>
  );
}
