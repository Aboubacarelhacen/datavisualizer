import { ChartRecommendation, ChartType, ChartCategory, DatasetSchema, ColumnSchema } from '@/types';
import {
  buildBarSpec,
  buildLineSpec,
  buildAreaSpec,
  buildScatterSpec,
  buildHistogramSpec,
  buildBoxplotSpec,
  buildHeatmapSpec,
  buildPieSpec,
  buildComboSpec,
} from './vegaSpecBuilder';

/**
 * Recommends charts based on dataset schema
 */

interface ChartTypeInfo {
  type: ChartType;
  name: string;
  description: string;
  category: ChartCategory;
  requirements: {
    minNumeric: number;
    minCategorical: number;
    needsDatetime: boolean;
  };
}

const CHART_TYPES: ChartTypeInfo[] = [
  {
    type: 'bar',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    category: 'comparison',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: false },
  },
  {
    type: 'bar-horizontal',
    name: 'Horizontal Bar Chart',
    description: 'Compare values with long category labels',
    category: 'comparison',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: false },
  },
  {
    type: 'bar-stacked',
    name: 'Stacked Bar Chart',
    description: 'Show composition within categories',
    category: 'composition',
    requirements: { minNumeric: 1, minCategorical: 2, needsDatetime: false },
  },
  {
    type: 'line',
    name: 'Line Chart',
    description: 'Show trends over time',
    category: 'trend',
    requirements: { minNumeric: 1, minCategorical: 0, needsDatetime: true },
  },
  {
    type: 'area',
    name: 'Area Chart',
    description: 'Show cumulative trends over time',
    category: 'trend',
    requirements: { minNumeric: 1, minCategorical: 0, needsDatetime: true },
  },
  {
    type: 'area-stacked',
    name: 'Stacked Area Chart',
    description: 'Show composition trends over time',
    category: 'trend',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: true },
  },
  {
    type: 'scatter',
    name: 'Scatter Plot',
    description: 'Explore relationships between two variables',
    category: 'relationship',
    requirements: { minNumeric: 2, minCategorical: 0, needsDatetime: false },
  },
  {
    type: 'bubble',
    name: 'Bubble Chart',
    description: 'Explore relationships with size dimension',
    category: 'relationship',
    requirements: { minNumeric: 3, minCategorical: 0, needsDatetime: false },
  },
  {
    type: 'histogram',
    name: 'Histogram',
    description: 'Show distribution of a numeric variable',
    category: 'distribution',
    requirements: { minNumeric: 1, minCategorical: 0, needsDatetime: false },
  },
  {
    type: 'boxplot',
    name: 'Box Plot',
    description: 'Compare distributions across categories',
    category: 'distribution',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: false },
  },
  {
    type: 'heatmap',
    name: 'Heatmap',
    description: 'Show intensity across two dimensions',
    category: 'relationship',
    requirements: { minNumeric: 1, minCategorical: 2, needsDatetime: false },
  },
  {
    type: 'pie',
    name: 'Pie Chart',
    description: 'Show parts of a whole',
    category: 'composition',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: false },
  },
  {
    type: 'donut',
    name: 'Donut Chart',
    description: 'Show parts of a whole with center space',
    category: 'composition',
    requirements: { minNumeric: 1, minCategorical: 1, needsDatetime: false },
  },
  {
    type: 'combo',
    name: 'Combo Chart',
    description: 'Combine bar and line for different scales',
    category: 'comparison',
    requirements: { minNumeric: 2, minCategorical: 1, needsDatetime: false },
  },
];

function getColumnsByType(schema: DatasetSchema) {
  const numeric = schema.columns.filter(c => c.type === 'number');
  const categorical = schema.columns.filter(c => c.type === 'string' && c.uniqueCount < 50);
  const datetime = schema.columns.filter(c => c.type === 'datetime');
  
  return { numeric, categorical, datetime };
}

function calculateSuitability(
  chartInfo: ChartTypeInfo,
  numericCount: number,
  categoricalCount: number,
  hasDatetime: boolean
): number {
  const { requirements } = chartInfo;
  
  // Check basic requirements
  if (numericCount < requirements.minNumeric) return 0;
  if (categoricalCount < requirements.minCategorical) return 0;
  if (requirements.needsDatetime && !hasDatetime) return 0;
  
  // Calculate score based on match quality
  let score = 50; // Base score for meeting requirements
  
  // Bonus for exact match
  if (numericCount === requirements.minNumeric) score += 10;
  if (categoricalCount === requirements.minCategorical) score += 10;
  if (requirements.needsDatetime === hasDatetime) score += 10;
  
  // Chart-specific bonuses
  if (chartInfo.type === 'bar' && categoricalCount >= 1 && numericCount >= 1) {
    score += 15; // Bar charts are versatile
  }
  
  if (chartInfo.type === 'line' && hasDatetime) {
    score += 20; // Line charts excel at time series
  }
  
  if (chartInfo.type === 'scatter' && numericCount >= 2) {
    score += 15; // Scatter plots are great for relationships
  }
  
  if (chartInfo.type === 'pie' && categoricalCount === 1 && numericCount === 1) {
    score += 10; // Pie charts for simple composition
  }
  
  return Math.min(100, score);
}

export function recommendCharts(
  data: Record<string, unknown>[],
  schema: DatasetSchema
): ChartRecommendation[] {
  const { numeric, categorical, datetime } = getColumnsByType(schema);
  
  const recommendations: ChartRecommendation[] = [];
  
  for (const chartInfo of CHART_TYPES) {
    const score = calculateSuitability(
      chartInfo,
      numeric.length,
      categorical.length,
      datetime.length > 0
    );
    
    if (score > 0) {
      // Generate suggested encodings
      const suggestedEncodings: ChartRecommendation['suggestedEncodings'] = {};
      
      // Assign fields based on chart type
      if (chartInfo.requirements.needsDatetime && datetime.length > 0) {
        suggestedEncodings.x = datetime[0].name;
      } else if (categorical.length > 0) {
        suggestedEncodings.x = categorical[0].name;
      } else if (numeric.length > 0) {
        suggestedEncodings.x = numeric[0].name;
      }
      
      if (numeric.length > 0) {
        suggestedEncodings.y = numeric[0].name;
      }
      
      if (categorical.length > 1) {
        suggestedEncodings.color = categorical[1].name;
      } else if (categorical.length === 1 && chartInfo.type !== 'pie' && chartInfo.type !== 'donut') {
        suggestedEncodings.color = categorical[0].name;
      }
      
      if (numeric.length > 2 && (chartInfo.type === 'bubble' || chartInfo.type === 'scatter')) {
        suggestedEncodings.size = numeric[2].name;
      }
      
      // Build the actual Vega-Lite spec
      let vegaLiteSpec: object | null = null;
      
      const x = suggestedEncodings.x || '';
      const y = suggestedEncodings.y || x;
      const color = suggestedEncodings.color;
      const size = suggestedEncodings.size;
      
      switch (chartInfo.type) {
        case 'bar':
          vegaLiteSpec = buildBarSpec(data, x, y, color);
          break;
        case 'bar-horizontal':
          vegaLiteSpec = buildBarSpec(data, x, y, color, true);
          break;
        case 'bar-stacked':
          vegaLiteSpec = buildBarSpec(data, x, y, color, false, true);
          break;
        case 'line':
          vegaLiteSpec = buildLineSpec(data, x, y, color);
          break;
        case 'area':
          vegaLiteSpec = buildAreaSpec(data, x, y, color);
          break;
        case 'area-stacked':
          vegaLiteSpec = buildAreaSpec(data, x, y, color, true);
          break;
        case 'scatter':
          vegaLiteSpec = buildScatterSpec(data, x, y, color, size);
          break;
        case 'bubble':
          vegaLiteSpec = buildScatterSpec(data, x, y, color, size);
          break;
        case 'histogram':
          vegaLiteSpec = buildHistogramSpec(data, x);
          break;
        case 'boxplot':
          vegaLiteSpec = buildBoxplotSpec(data, x, y);
          break;
        case 'heatmap':
          vegaLiteSpec = buildHeatmapSpec(data, x, color || y, y);
          break;
        case 'pie':
          vegaLiteSpec = buildPieSpec(data, x, y);
          break;
        case 'donut':
          vegaLiteSpec = buildPieSpec(data, x, y, true);
          break;
        case 'combo':
          if (numeric.length >= 2) {
            vegaLiteSpec = buildComboSpec(data, x, y, numeric[1].name);
          }
          break;
      }
      
      if (vegaLiteSpec) {
        // Generate a contextual title
        const title = generateChartTitle(chartInfo, suggestedEncodings, schema);
        
        recommendations.push({
          type: chartInfo.type,
          title,
          description: chartInfo.description,
          category: chartInfo.category,
          suitabilityScore: score,
          suggestedEncodings,
          vegaLiteSpec,
        });
      }
    }
  }
  
  // Sort by suitability score
  return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

function generateChartTitle(
  chartInfo: ChartTypeInfo,
  encodings: ChartRecommendation['suggestedEncodings'],
  schema: DatasetSchema
): string {
  const y = encodings.y || '';
  const x = encodings.x || '';
  const color = encodings.color;
  
  switch (chartInfo.category) {
    case 'trend':
      return `${y} over ${x}`;
    case 'comparison':
      return color ? `${y} by ${x} and ${color}` : `${y} by ${x}`;
    case 'distribution':
      return `Distribution of ${y || x}`;
    case 'relationship':
      return `${y} vs ${x}`;
    case 'composition':
      return `Composition of ${y} by ${x}`;
    default:
      return `${chartInfo.name}: ${y || x}`;
  }
}

export function getCategoryIcon(category: ChartCategory): string {
  switch (category) {
    case 'trend':
      return '📈';
    case 'comparison':
      return '📊';
    case 'distribution':
      return '📉';
    case 'relationship':
      return '🔗';
    case 'composition':
      return '🥧';
    default:
      return '📊';
  }
}
