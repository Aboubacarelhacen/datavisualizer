import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import embed from "vega-embed";
import { ChartRecommendation, ChartCategory } from "@/types";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/chartRecommender";

interface ChartCardProps {
  recommendation: ChartRecommendation;
  isSelected?: boolean;
  onClick: () => void;
  index: number;
}

const categoryColors: Record<ChartCategory, string> = {
  trend: "from-aurora-cyan/20 to-aurora-blue/20 border-aurora-cyan/30",
  comparison: "from-aurora-purple/20 to-aurora-pink/20 border-aurora-purple/30",
  distribution: "from-aurora-teal/20 to-aurora-cyan/20 border-aurora-teal/30",
  relationship: "from-aurora-blue/20 to-aurora-purple/20 border-aurora-blue/30",
  composition: "from-aurora-pink/20 to-aurora-purple/20 border-aurora-pink/30",
};

export function ChartCard({
  recommendation,
  isSelected,
  onClick,
  index,
}: ChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !recommendation.vegaLiteSpec) return;

    // Clear previous content
    chartRef.current.innerHTML = "";

    // Create a mini version of the chart for the card
    const miniSpec = {
      ...recommendation.vegaLiteSpec,
      width: 180,
      height: 100,
      autosize: { type: "fit", contains: "padding" },
      config: {
        ...(recommendation.vegaLiteSpec as any).config,
        axis: {
          labels: false,
          ticks: false,
          domain: false,
          grid: false,
          title: null,
        },
        legend: { disable: true },
        view: { stroke: "transparent" },
        background: "transparent",
      },
    };

    embed(chartRef.current, miniSpec as any, {
      actions: false,
      renderer: "svg",
      tooltip: false,
    }).catch((err) => {
      console.error("Chart embed error:", err);
      if (chartRef.current) {
        chartRef.current.innerHTML =
          '<div class="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Preview unavailable</div>';
      }
    });
  }, [recommendation.vegaLiteSpec]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border p-4 text-left transition-all duration-300 hover-lift group",
        "bg-gradient-to-br",
        categoryColors[recommendation.category],
        isSelected
          ? "ring-2 ring-aurora-cyan shadow-glow"
          : "hover:border-border"
      )}
    >
      {/* Score Badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium">
        <span className="text-aurora-cyan">
          {recommendation.suitabilityScore}
        </span>
        <span className="text-muted-foreground">/ 100</span>
      </div>

      {/* Chart Preview */}
      <div
        ref={chartRef}
        className="w-full h-[100px] mb-3 rounded-lg overflow-hidden bg-background/30"
      />

      {/* Title & Category */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {getCategoryIcon(recommendation.category)}
          </span>
          <h4 className="text-sm font-medium truncate">
            {recommendation.title}
          </h4>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">
          {recommendation.description}
        </p>

        {/* Category Tag */}
        <div className="flex items-center gap-2">
          <span className="chart-tag capitalize">
            {recommendation.category}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {recommendation.type}
          </span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute inset-0 rounded-xl ring-2 ring-aurora-cyan pointer-events-none"
        />
      )}
    </motion.button>
  );
}
