import { motion } from 'framer-motion';
import { ChartRecommendation } from '@/types';
import { ChartCard } from './ChartCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, AlertCircle } from 'lucide-react';

interface ChartGalleryProps {
  recommendations: ChartRecommendation[];
  selectedChart: ChartRecommendation | null;
  onSelectChart: (chart: ChartRecommendation) => void;
}

export function ChartGallery({ recommendations, selectedChart, onSelectChart }: ChartGalleryProps) {
  if (recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[300px] text-center p-6"
      >
        <div className="h-16 w-16 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No recommendations yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Upload a dataset to see chart recommendations
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-aurora-cyan" />
        <h3 className="font-medium text-sm">Recommended Charts</h3>
        <span className="text-xs text-muted-foreground">
          {recommendations.length} options
        </span>
      </div>

      <ScrollArea className="h-[calc(100vh-420px)] pr-4">
        <div className="grid grid-cols-1 gap-3">
          {recommendations.slice(0, 10).map((rec, index) => (
            <ChartCard
              key={`${rec.type}-${rec.title}`}
              recommendation={rec}
              isSelected={selectedChart?.type === rec.type && selectedChart?.title === rec.title}
              onClick={() => onSelectChart(rec)}
              index={index}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
