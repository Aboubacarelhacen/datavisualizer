import { motion, AnimatePresence } from 'framer-motion';
import { FavoriteChart } from '@/types';
import { Heart, Trash2, Clock, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoritesPanelProps {
  favorites: FavoriteChart[];
  onSelect: (favorite: FavoriteChart) => void;
  onRemove: (id: string) => void;
}

export function FavoritesPanel({ favorites, onSelect, onRemove }: FavoritesPanelProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center p-6">
        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
          <Heart className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No favorites yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Save charts you want to revisit later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-aurora-pink" />
          <h3 className="font-medium text-sm">Saved Charts</h3>
        </div>
        <span className="text-xs text-muted-foreground">{favorites.length}</span>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
          <AnimatePresence>
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-xl border border-border/50 bg-card/50 p-3 hover:border-aurora-pink/30 hover:bg-card transition-all cursor-pointer"
                onClick={() => onSelect(favorite)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{favorite.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {favorite.prompt}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <FileSpreadsheet className="h-3 w-3" />
                        {favorite.datasetName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {favorite.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(favorite.id);
                    }}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
