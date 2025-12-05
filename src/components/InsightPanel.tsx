import { motion } from 'framer-motion';
import { Insight } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpCircle, 
  ArrowDownCircle,
  AlertTriangle,
  BarChart3,
  Lightbulb 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightPanelProps {
  insights: Insight[];
}

const insightIcons: Record<string, React.ReactNode> = {
  max: <ArrowUpCircle className="h-4 w-4 text-aurora-cyan" />,
  min: <ArrowDownCircle className="h-4 w-4 text-aurora-purple" />,
  trend: <TrendingUp className="h-4 w-4 text-aurora-teal" />,
  outlier: <AlertTriangle className="h-4 w-4 text-aurora-pink" />,
  comparison: <BarChart3 className="h-4 w-4 text-aurora-blue" />,
  distribution: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export function InsightPanel({ insights }: InsightPanelProps) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl bg-card/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-aurora-cyan" />
          <h3 className="font-medium text-sm">Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Select a chart to see data insights
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card/50 border border-border/50 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-4 w-4 text-aurora-cyan" />
        <h3 className="font-medium text-sm">Key Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={`${insight.type}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg',
              'bg-gradient-to-r from-muted/50 to-transparent',
              'border-l-2',
              insight.type === 'max' && 'border-l-aurora-cyan',
              insight.type === 'min' && 'border-l-aurora-purple',
              insight.type === 'trend' && 'border-l-aurora-teal',
              insight.type === 'outlier' && 'border-l-aurora-pink',
              insight.type === 'comparison' && 'border-l-aurora-blue',
              insight.type === 'distribution' && 'border-l-muted-foreground',
            )}
          >
            <div className="mt-0.5">
              {insightIcons[insight.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insight.description}
              </p>
              {insight.value !== undefined && (
                <p className="text-sm font-semibold text-aurora-cyan mt-1">
                  {typeof insight.value === 'number' 
                    ? insight.value.toLocaleString() 
                    : insight.value
                  }
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Integration Note */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground/70 italic">
          💡 AI-powered insights coming soon
        </p>
      </div>
    </div>
  );
}
