// Dataset Types
export type ColumnType = 'number' | 'string' | 'datetime' | 'boolean' | 'unknown';

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  sampleValues: (string | number | boolean | null)[];
  uniqueCount: number;
  nullCount: number;
  nullRatio: number;
}

export interface DatasetSchema {
  columns: ColumnSchema[];
  rowCount: number;
  fileName: string;
  fileType: 'csv' | 'json' | 'xlsx';
}

export interface Dataset {
  data: Record<string, unknown>[];
  schema: DatasetSchema;
}

// Chart Types
export type ChartType = 
  | 'bar'
  | 'bar-horizontal'
  | 'bar-grouped'
  | 'bar-stacked'
  | 'line'
  | 'area'
  | 'area-stacked'
  | 'scatter'
  | 'bubble'
  | 'histogram'
  | 'boxplot'
  | 'heatmap'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'timeline'
  | 'combo';

export type ChartCategory = 'trend' | 'distribution' | 'relationship' | 'composition' | 'comparison';

export interface ChartRecommendation {
  type: ChartType;
  title: string;
  description: string;
  category: ChartCategory;
  suitabilityScore: number;
  suggestedEncodings: {
    x?: string;
    y?: string;
    color?: string;
    size?: string;
  };
  vegaLiteSpec: object;
}

// Intent from Natural Language
export interface ChartIntent {
  chartType?: ChartType;
  xField?: string;
  yField?: string;
  colorField?: string;
  sizeField?: string;
  filterConditions?: { field: string; value: string | number }[];
  aggregation?: 'sum' | 'mean' | 'count' | 'min' | 'max';
  sortOrder?: 'ascending' | 'descending';
  timeGranularity?: 'day' | 'week' | 'month' | 'year';
}

// Insight Types
export interface Insight {
  type: 'max' | 'min' | 'trend' | 'outlier' | 'comparison' | 'distribution';
  title: string;
  description: string;
  value?: string | number;
}

// Favorites
export interface FavoriteChart {
  id: string;
  name: string;
  prompt: string;
  vegaLiteSpec: object;
  createdAt: Date;
  datasetName: string;
}

// Prompt History
export interface PromptHistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
  chartType?: ChartType;
}
