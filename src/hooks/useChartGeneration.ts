import { useState, useCallback, useMemo } from 'react';
import { ChartRecommendation, Dataset, ChartIntent } from '@/types';
import { recommendCharts } from '@/lib/chartRecommender';
import { parsePrompt } from '@/lib/promptParser';
import { buildSpecFromIntent } from '@/lib/vegaSpecBuilder';
import { generateInsights } from '@/lib/insightGenerator';

export function useChartGeneration(dataset: Dataset | null) {
  const [selectedChart, setSelectedChart] = useState<ChartRecommendation | null>(null);
  const [customSpec, setCustomSpec] = useState<object | null>(null);
  const [currentIntent, setCurrentIntent] = useState<ChartIntent | null>(null);

  // Generate recommendations whenever dataset changes
  const recommendations = useMemo(() => {
    if (!dataset) return [];
    return recommendCharts(dataset.data, dataset.schema);
  }, [dataset]);

  // Generate insights for selected chart
  const insights = useMemo(() => {
    if (!dataset || !selectedChart) return [];
    return generateInsights(
      dataset.data,
      dataset.schema,
      selectedChart.suggestedEncodings.x,
      selectedChart.suggestedEncodings.y
    );
  }, [dataset, selectedChart]);

  const selectChart = useCallback((chart: ChartRecommendation) => {
    setSelectedChart(chart);
    setCustomSpec(null);
    setCurrentIntent({
      chartType: chart.type,
      xField: chart.suggestedEncodings.x,
      yField: chart.suggestedEncodings.y,
      colorField: chart.suggestedEncodings.color,
    });
  }, []);

  const generateFromPrompt = useCallback((prompt: string) => {
    if (!dataset) return null;
    
    const intent = parsePrompt(prompt, dataset.schema);
    setCurrentIntent(intent);
    
    const spec = buildSpecFromIntent(dataset.data, dataset.schema, intent);
    
    if (spec) {
      setCustomSpec(spec);
      setSelectedChart(null);
      return spec;
    }
    
    return null;
  }, [dataset]);

  const currentSpec = customSpec || selectedChart?.vegaLiteSpec || null;

  return {
    recommendations,
    selectedChart,
    selectChart,
    generateFromPrompt,
    currentSpec,
    currentIntent,
    insights,
  };
}
