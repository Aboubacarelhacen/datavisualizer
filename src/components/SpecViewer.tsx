import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface SpecViewerProps {
  spec: object | null;
  onExportPNG?: () => void;
}

export function SpecViewer({ spec, onExportPNG }: SpecViewerProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!spec) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Vega-Lite spec copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadJSON = () => {
    if (!spec) return;
    
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vega-lite-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded!',
      description: 'Vega-Lite spec saved as JSON',
    });
  };

  if (!spec) {
    return (
      <div className="rounded-xl bg-card/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Code className="h-4 w-4 text-aurora-purple" />
          <h3 className="font-medium text-sm">Vega-Lite Spec</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Generate a chart to see its specification
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-aurora-purple" />
          <h3 className="font-medium text-sm">Vega-Lite Spec</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-aurora-cyan" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadJSON}
            className="h-7 px-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[200px]">
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 text-[10px] leading-relaxed font-mono text-muted-foreground overflow-x-auto"
        >
          {JSON.stringify(spec, null, 2)}
        </motion.pre>
      </ScrollArea>
    </div>
  );
}
