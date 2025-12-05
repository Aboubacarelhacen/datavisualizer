import { Insight, DatasetSchema } from '@/types';

/**
 * Generates insights from data
 * Uses heuristics - AI integration would provide richer insights
 */

interface DataStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  outliers: number[];
}

function calculateStats(values: number[]): DataStats {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  const min = sorted[0];
  const max = sorted[n - 1];
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0 
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
    : sorted[Math.floor(n / 2)];
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Calculate trend (simple linear regression)
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend: 'increasing' | 'decreasing' | 'stable' = 
    slope > 0.1 * mean ? 'increasing' : 
    slope < -0.1 * mean ? 'decreasing' : 'stable';
  
  // Find outliers (values > 2 standard deviations from mean)
  const outliers = values.filter(v => Math.abs(v - mean) > 2 * stdDev);
  
  return { min, max, mean, median, stdDev, trend, outliers };
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else if (Number.isInteger(num)) {
    return num.toString();
  } else {
    return num.toFixed(2);
  }
}

export function generateInsights(
  data: Record<string, unknown>[],
  schema: DatasetSchema,
  xField?: string,
  yField?: string
): Insight[] {
  const insights: Insight[] = [];
  
  if (data.length === 0) return insights;
  
  // Find numeric columns to analyze
  const numericColumns = schema.columns.filter(c => c.type === 'number');
  const targetColumn = yField 
    ? numericColumns.find(c => c.name === yField)
    : numericColumns[0];
  
  if (!targetColumn) return insights;
  
  // Extract numeric values
  const values = data
    .map(row => {
      const val = row[targetColumn.name];
      return typeof val === 'number' ? val : parseFloat(String(val));
    })
    .filter(v => !isNaN(v));
  
  if (values.length === 0) return insights;
  
  const stats = calculateStats(values);
  
  // Maximum value insight
  insights.push({
    type: 'max',
    title: 'Highest Value',
    description: `The maximum ${targetColumn.name} is ${formatNumber(stats.max)}`,
    value: stats.max,
  });
  
  // Minimum value insight
  insights.push({
    type: 'min',
    title: 'Lowest Value',
    description: `The minimum ${targetColumn.name} is ${formatNumber(stats.min)}`,
    value: stats.min,
  });
  
  // Trend insight
  if (xField) {
    const trendDescriptions = {
      increasing: `${targetColumn.name} shows an upward trend over ${xField}`,
      decreasing: `${targetColumn.name} shows a downward trend over ${xField}`,
      stable: `${targetColumn.name} remains relatively stable over ${xField}`,
    };
    
    insights.push({
      type: 'trend',
      title: stats.trend === 'increasing' ? 'Upward Trend' : 
             stats.trend === 'decreasing' ? 'Downward Trend' : 'Stable Pattern',
      description: trendDescriptions[stats.trend],
    });
  }
  
  // Outliers insight
  if (stats.outliers.length > 0) {
    insights.push({
      type: 'outlier',
      title: 'Outliers Detected',
      description: `Found ${stats.outliers.length} outlier${stats.outliers.length > 1 ? 's' : ''} that deviate significantly from the average`,
      value: stats.outliers.length,
    });
  }
  
  // Distribution insight
  const range = stats.max - stats.min;
  const spreadRatio = stats.stdDev / stats.mean;
  insights.push({
    type: 'distribution',
    title: spreadRatio > 0.5 ? 'High Variability' : 'Low Variability',
    description: spreadRatio > 0.5 
      ? `${targetColumn.name} values vary widely (range: ${formatNumber(range)})`
      : `${targetColumn.name} values are fairly consistent around ${formatNumber(stats.mean)}`,
  });
  
  // Category comparison (if categorical field exists)
  const categoricalColumn = schema.columns.find(
    c => c.type === 'string' && c.name === xField
  );
  
  if (categoricalColumn) {
    // Group by category and find top performer
    const categoryTotals: Record<string, number> = {};
    for (const row of data) {
      const category = String(row[categoricalColumn.name]);
      const value = typeof row[targetColumn.name] === 'number' 
        ? row[targetColumn.name] as number 
        : parseFloat(String(row[targetColumn.name]));
      
      if (!isNaN(value)) {
        categoryTotals[category] = (categoryTotals[category] || 0) + value;
      }
    }
    
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      insights.push({
        type: 'comparison',
        title: 'Top Performer',
        description: `"${topCategory[0]}" leads with ${formatNumber(topCategory[1])} total ${targetColumn.name}`,
        value: topCategory[1],
      });
    }
  }
  
  return insights;
}

/**
 * TODO: AI Integration Point
 * 
 * Here we would call an LLM to generate richer, more contextual insights:
 * 
 * async function generateInsightsWithAI(
 *   data: Record<string, unknown>[],
 *   schema: DatasetSchema,
 *   vegaLiteSpec: object
 * ): Promise<Insight[]> {
 *   const systemPrompt = `You are a data analyst. Given a dataset and its visualization,
 *     provide 3-5 key insights about patterns, trends, and notable observations.
 *     Be specific with numbers and percentages when possible.
 *     
 *     Dataset summary:
 *     - ${schema.rowCount} rows
 *     - Columns: ${schema.columns.map(c => `${c.name} (${c.type})`).join(', ')}
 *     
 *     Sample data: ${JSON.stringify(data.slice(0, 10))}
 *     
 *     Return insights as JSON array with: type, title, description`;
 *   
 *   const response = await callLLM(systemPrompt, JSON.stringify(vegaLiteSpec));
 *   return JSON.parse(response);
 * }
 */
