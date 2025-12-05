import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, FileJson, Heart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ExportActionsProps {
  spec: object | null;
  onSaveFavorite?: (name: string) => void;
}

export function ExportActions({ spec, onSaveFavorite }: ExportActionsProps) {
  const [favoriteName, setFavoriteName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedFavorite, setSavedFavorite] = useState(false);
  const { toast } = useToast();

  const handleExportPNG = () => {
    // Find the canvas element from the vega chart
    const canvas = document.querySelector('.vega-embed canvas') as HTMLCanvasElement;
    if (!canvas) {
      toast({
        title: 'Export failed',
        description: 'No chart found to export',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aurora-vibe-chart.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: 'Exported!',
        description: 'Chart saved as PNG',
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description: 'Could not export chart',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = () => {
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

  const handleSaveFavorite = () => {
    if (!favoriteName.trim()) return;
    
    onSaveFavorite?.(favoriteName.trim());
    setFavoriteName('');
    setIsDialogOpen(false);
    setSavedFavorite(true);
    
    toast({
      title: 'Saved!',
      description: 'Chart added to favorites',
    });
    
    setTimeout(() => setSavedFavorite(false), 2000);
  };

  if (!spec) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPNG}
        className="gap-2 border-border/50 hover:border-aurora-cyan/50 hover:bg-aurora-cyan/10"
      >
        <Image className="h-4 w-4" />
        PNG
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportJSON}
        className="gap-2 border-border/50 hover:border-aurora-purple/50 hover:bg-aurora-purple/10"
      >
        <FileJson className="h-4 w-4" />
        JSON
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border/50 hover:border-aurora-pink/50 hover:bg-aurora-pink/10"
          >
            {savedFavorite ? (
              <Check className="h-4 w-4 text-aurora-cyan" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            Save
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Save to Favorites</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Chart name..."
              value={favoriteName}
              onChange={(e) => setFavoriteName(e.target.value)}
              className="bg-muted/50 border-border/50"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFavorite}
                disabled={!favoriteName.trim()}
                className="bg-aurora-gradient hover:opacity-90"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
