import { ChartIntent, ChartType, DatasetSchema } from '@/types';

/**
 * Parses natural language prompts (Turkish & English) to chart intent
 * This is a rule-based parser - AI integration would improve accuracy
 */

// Chart type keywords (Turkish + English)
const CHART_TYPE_KEYWORDS: Record<string, ChartType[]> = {
  // Bar charts
  'bar': ['bar'],
  'bar chart': ['bar'],
  'çubuk': ['bar'],
  'çubuk grafik': ['bar'],
  'sütun': ['bar'],
  'sütun grafik': ['bar'],
  'horizontal bar': ['bar-horizontal'],
  'yatay çubuk': ['bar-horizontal'],
  'stacked bar': ['bar-stacked'],
  'yığılmış çubuk': ['bar-stacked'],
  
  // Line charts
  'line': ['line'],
  'line chart': ['line'],
  'çizgi': ['line'],
  'çizgi grafik': ['line'],
  'trend': ['line'],
  'zaman serisi': ['line'],
  'time series': ['line'],
  
  // Area charts
  'area': ['area'],
  'area chart': ['area'],
  'alan': ['area'],
  'alan grafik': ['area'],
  'stacked area': ['area-stacked'],
  'yığılmış alan': ['area-stacked'],
  
  // Scatter/Bubble
  'scatter': ['scatter'],
  'scatter plot': ['scatter'],
  'saçılım': ['scatter'],
  'nokta': ['scatter'],
  'bubble': ['bubble'],
  'bubble chart': ['bubble'],
  'balon': ['bubble'],
  
  // Distribution
  'histogram': ['histogram'],
  'histograms': ['histogram'],
  'dağılım': ['histogram', 'boxplot'],
  'distribution': ['histogram', 'boxplot'],
  'boxplot': ['boxplot'],
  'box plot': ['boxplot'],
  'kutu': ['boxplot'],
  
  // Heatmap
  'heatmap': ['heatmap'],
  'heat map': ['heatmap'],
  'ısı haritası': ['heatmap'],
  
  // Pie/Donut
  'pie': ['pie'],
  'pie chart': ['pie'],
  'pasta': ['pie'],
  'pasta grafik': ['pie'],
  'donut': ['donut'],
  'halka': ['donut'],
  
  // Combo
  'combo': ['combo'],
  'combined': ['combo'],
  'birleşik': ['combo'],
};

// Action keywords
const ACTION_KEYWORDS: Record<string, string> = {
  // Show/Display
  'show': 'display',
  'display': 'display',
  'göster': 'display',
  'görüntüle': 'display',
  'çiz': 'display',
  'oluştur': 'display',
  'create': 'display',
  'make': 'display',
  'generate': 'display',
  
  // Compare
  'compare': 'compare',
  'karşılaştır': 'compare',
  'kıyas': 'compare',
  'kıyasla': 'compare',
  
  // Analyze
  'analyze': 'analyze',
  'analiz': 'analyze',
  'incele': 'analyze',
};

// Time-related keywords
const TIME_KEYWORDS = [
  'time', 'date', 'month', 'year', 'week', 'day', 'quarter',
  'zaman', 'tarih', 'ay', 'yıl', 'hafta', 'gün', 'çeyrek',
  'son', 'last', 'recent', 'son dönem', 'trend', 'over time',
];

// Aggregation keywords
const AGGREGATION_KEYWORDS: Record<string, 'sum' | 'mean' | 'count' | 'min' | 'max'> = {
  'total': 'sum',
  'toplam': 'sum',
  'sum': 'sum',
  'average': 'mean',
  'ortalama': 'mean',
  'mean': 'mean',
  'count': 'count',
  'sayı': 'count',
  'adet': 'count',
  'minimum': 'min',
  'min': 'min',
  'en düşük': 'min',
  'maximum': 'max',
  'max': 'max',
  'en yüksek': 'max',
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findChartType(text: string): ChartType | undefined {
  const normalized = normalizeText(text);
  
  // Check for multi-word keywords first (longer matches first)
  const sortedKeywords = Object.keys(CHART_TYPE_KEYWORDS).sort((a, b) => b.length - a.length);
  
  for (const keyword of sortedKeywords) {
    if (normalized.includes(keyword)) {
      return CHART_TYPE_KEYWORDS[keyword][0];
    }
  }
  
  // Check for time-related keywords suggesting line/area charts
  for (const timeKeyword of TIME_KEYWORDS) {
    if (normalized.includes(timeKeyword)) {
      return 'line';
    }
  }
  
  return undefined;
}

function findFieldMatches(text: string, schema: DatasetSchema): {
  xField?: string;
  yField?: string;
  colorField?: string;
} {
  const normalized = normalizeText(text);
  const result: { xField?: string; yField?: string; colorField?: string } = {};
  
  // Try to find column names mentioned in the prompt
  const numericColumns = schema.columns.filter(c => c.type === 'number');
  const categoricalColumns = schema.columns.filter(c => c.type === 'string');
  const dateColumns = schema.columns.filter(c => c.type === 'datetime');
  
  // Check each column name
  for (const col of schema.columns) {
    const colNameLower = col.name.toLowerCase();
    if (normalized.includes(colNameLower)) {
      if (col.type === 'datetime') {
        result.xField = col.name;
      } else if (col.type === 'number' && !result.yField) {
        result.yField = col.name;
      } else if (col.type === 'string' && !result.colorField) {
        result.colorField = col.name;
      }
    }
  }
  
  // If no specific fields found, use defaults
  if (!result.xField && dateColumns.length > 0) {
    result.xField = dateColumns[0].name;
  } else if (!result.xField && categoricalColumns.length > 0) {
    result.xField = categoricalColumns[0].name;
  }
  
  if (!result.yField && numericColumns.length > 0) {
    result.yField = numericColumns[0].name;
  }
  
  if (!result.colorField && categoricalColumns.length > 1) {
    result.colorField = categoricalColumns.find(c => c.name !== result.xField)?.name;
  }
  
  return result;
}

function findAggregation(text: string): 'sum' | 'mean' | 'count' | 'min' | 'max' | undefined {
  const normalized = normalizeText(text);
  
  for (const [keyword, agg] of Object.entries(AGGREGATION_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return agg;
    }
  }
  
  return 'sum'; // Default to sum
}

export function parsePrompt(prompt: string, schema: DatasetSchema): ChartIntent {
  const chartType = findChartType(prompt);
  const fieldMatches = findFieldMatches(prompt, schema);
  const aggregation = findAggregation(prompt);
  
  return {
    chartType: chartType || 'bar', // Default to bar chart
    xField: fieldMatches.xField,
    yField: fieldMatches.yField,
    colorField: fieldMatches.colorField,
    aggregation,
  };
}

// Example prompts for users
export const EXAMPLE_PROMPTS = {
  turkish: [
    'Kategorilere göre satışları bar grafik olarak göster',
    'Son 6 aydaki satış trendini çiz',
    'Ürün kategorilerinin dağılımını pasta grafik ile göster',
    'Fiyat ve miktar arasındaki ilişkiyi saçılım grafiği ile göster',
    'Aylık gelirleri yığılmış alan grafik ile göster',
  ],
  english: [
    'Show sales by category as a bar chart',
    'Display the trend of revenue over time',
    'Create a pie chart showing the distribution by region',
    'Scatter plot of price vs quantity',
    'Compare monthly sales with a line chart',
  ],
};

/**
 * TODO: AI Integration Point
 * 
 * Here we would call an LLM (NotebookLM, GPT, etc.) to:
 * 1. Better understand the user's intent
 * 2. Extract entities and relationships from natural language
 * 3. Handle ambiguous or complex queries
 * 4. Suggest clarifications when needed
 * 
 * Example integration:
 * 
 * async function parsePromptWithAI(prompt: string, schema: DatasetSchema): Promise<ChartIntent> {
 *   const systemPrompt = `You are a data visualization assistant. Given a user's request and a dataset schema,
 *     extract the chart type, fields to use for x, y, color encodings, and any filters or aggregations.
 *     
 *     Dataset schema: ${JSON.stringify(schema)}
 *     
 *     Return a JSON object with: chartType, xField, yField, colorField, aggregation`;
 *   
 *   const response = await callLLM(systemPrompt, prompt);
 *   return JSON.parse(response);
 * }
 */
