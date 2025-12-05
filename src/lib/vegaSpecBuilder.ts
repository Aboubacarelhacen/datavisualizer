import { ChartType, DatasetSchema, ChartIntent } from '@/types';

/**
 * Builds Vega-Lite specifications from dataset schema and chart intent
 */

const AURORA_COLORS = [
  '#00ffff', // cyan
  '#9966ff', // purple
  '#ff66b2', // pink
  '#00cc99', // teal
  '#3399ff', // blue
  '#ffcc00', // gold
  '#ff6666', // coral
  '#66ff99', // mint
];

interface VegaLiteSpec {
  $schema: string;
  data: { values: Record<string, unknown>[] };
  mark?: string | { type: string; [key: string]: unknown };
  encoding?: Record<string, unknown>;
  config?: Record<string, unknown>;
  width?: number | string;
  height?: number | string;
  title?: string;
  layer?: unknown[];
  [key: string]: unknown;
}

const baseConfig = {
  background: 'transparent',
  view: { stroke: 'transparent' },
  axis: {
    labelColor: '#a0aec0',
    titleColor: '#e2e8f0',
    gridColor: '#2d3748',
    domainColor: '#4a5568',
    tickColor: '#4a5568',
  },
  legend: {
    labelColor: '#a0aec0',
    titleColor: '#e2e8f0',
  },
  title: {
    color: '#e2e8f0',
  },
};

export function buildBarSpec(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  color?: string,
  horizontal = false,
  stacked = false
): VegaLiteSpec {
  const spec: VegaLiteSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'bar', cornerRadiusEnd: 4 },
    encoding: {
      [horizontal ? 'y' : 'x']: {
        field: x,
        type: 'nominal',
        axis: { labelAngle: horizontal ? 0 : -45 },
        sort: '-y',
      },
      [horizontal ? 'x' : 'y']: {
        field: y,
        type: 'quantitative',
        aggregate: 'sum',
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };

  if (color && spec.encoding) {
    spec.encoding.color = {
      field: color,
      type: 'nominal',
      scale: { range: AURORA_COLORS },
    };
    if (stacked) {
      const key = horizontal ? 'x' : 'y';
      const existingEncoding = spec.encoding[key] as Record<string, unknown> | undefined;
      spec.encoding[key] = {
        ...existingEncoding,
        stack: 'normalize',
      };
    }
  }

  return spec;
}

export function buildLineSpec(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  color?: string
): VegaLiteSpec {
  const spec: VegaLiteSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'line', point: true, strokeWidth: 2 },
    encoding: {
      x: {
        field: x,
        type: 'temporal',
        axis: { labelAngle: -45 },
      },
      y: {
        field: y,
        type: 'quantitative',
        aggregate: 'sum',
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };

  if (color) {
    spec.encoding.color = {
      field: color,
      type: 'nominal',
      scale: { range: AURORA_COLORS },
    };
  }

  return spec;
}

export function buildAreaSpec(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  color?: string,
  stacked = false
): VegaLiteSpec {
  const spec: VegaLiteSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'area', opacity: 0.7, line: true },
    encoding: {
      x: {
        field: x,
        type: 'temporal',
        axis: { labelAngle: -45 },
      },
      y: {
        field: y,
        type: 'quantitative',
        aggregate: 'sum',
        stack: stacked ? 'normalize' : undefined,
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };

  if (color) {
    spec.encoding.color = {
      field: color,
      type: 'nominal',
      scale: { range: AURORA_COLORS },
    };
  }

  return spec;
}

export function buildScatterSpec(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  color?: string,
  size?: string
): VegaLiteSpec {
  const spec: VegaLiteSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'circle', opacity: 0.7 },
    encoding: {
      x: {
        field: x,
        type: 'quantitative',
      },
      y: {
        field: y,
        type: 'quantitative',
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };

  if (color) {
    spec.encoding.color = {
      field: color,
      type: 'nominal',
      scale: { range: AURORA_COLORS },
    };
  }

  if (size) {
    spec.encoding.size = {
      field: size,
      type: 'quantitative',
    };
  }

  return spec;
}

export function buildHistogramSpec(
  data: Record<string, unknown>[],
  field: string
): VegaLiteSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'bar', cornerRadiusEnd: 4 },
    encoding: {
      x: {
        field: field,
        type: 'quantitative',
        bin: { maxbins: 20 },
      },
      y: {
        aggregate: 'count',
        type: 'quantitative',
      },
      color: {
        value: AURORA_COLORS[0],
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };
}

export function buildBoxplotSpec(
  data: Record<string, unknown>[],
  category: string,
  value: string
): VegaLiteSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'boxplot', extent: 1.5 },
    encoding: {
      x: {
        field: category,
        type: 'nominal',
      },
      y: {
        field: value,
        type: 'quantitative',
      },
      color: {
        field: category,
        type: 'nominal',
        scale: { range: AURORA_COLORS },
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };
}

export function buildHeatmapSpec(
  data: Record<string, unknown>[],
  x: string,
  y: string,
  color: string
): VegaLiteSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: 'rect',
    encoding: {
      x: {
        field: x,
        type: 'nominal',
      },
      y: {
        field: y,
        type: 'nominal',
      },
      color: {
        field: color,
        type: 'quantitative',
        aggregate: 'mean',
        scale: {
          scheme: 'viridis',
        },
      },
    },
    config: baseConfig,
    width: 'container',
    height: 300,
  };
}

export function buildPieSpec(
  data: Record<string, unknown>[],
  category: string,
  value: string,
  donut = false
): VegaLiteSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    mark: { type: 'arc', innerRadius: donut ? 50 : 0 },
    encoding: {
      theta: {
        field: value,
        type: 'quantitative',
        aggregate: 'sum',
      },
      color: {
        field: category,
        type: 'nominal',
        scale: { range: AURORA_COLORS },
      },
    },
    config: baseConfig,
    width: 300,
    height: 300,
  };
}

export function buildComboSpec(
  data: Record<string, unknown>[],
  x: string,
  barY: string,
  lineY: string
): VegaLiteSpec {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    data: { values: data },
    layer: [
      {
        mark: { type: 'bar', cornerRadiusEnd: 4, color: AURORA_COLORS[0] },
        encoding: {
          x: { field: x, type: 'nominal' },
          y: { field: barY, type: 'quantitative', aggregate: 'sum' },
        },
      },
      {
        mark: { type: 'line', point: true, color: AURORA_COLORS[1], strokeWidth: 2 },
        encoding: {
          x: { field: x, type: 'nominal' },
          y: { field: lineY, type: 'quantitative', aggregate: 'sum' },
        },
      },
    ],
    config: baseConfig,
    width: 'container',
    height: 300,
  };
}

export function buildSpecFromIntent(
  data: Record<string, unknown>[],
  schema: DatasetSchema,
  intent: ChartIntent
): VegaLiteSpec | null {
  const { chartType, xField, yField, colorField, sizeField } = intent;
  
  if (!chartType || !xField) return null;

  switch (chartType) {
    case 'bar':
      return buildBarSpec(data, xField, yField || xField, colorField);
    case 'bar-horizontal':
      return buildBarSpec(data, xField, yField || xField, colorField, true);
    case 'bar-stacked':
      return buildBarSpec(data, xField, yField || xField, colorField, false, true);
    case 'line':
      return buildLineSpec(data, xField, yField || xField, colorField);
    case 'area':
      return buildAreaSpec(data, xField, yField || xField, colorField);
    case 'area-stacked':
      return buildAreaSpec(data, xField, yField || xField, colorField, true);
    case 'scatter':
      return buildScatterSpec(data, xField, yField || xField, colorField, sizeField);
    case 'bubble':
      return buildScatterSpec(data, xField, yField || xField, colorField, sizeField || yField);
    case 'histogram':
      return buildHistogramSpec(data, xField);
    case 'boxplot':
      return buildBoxplotSpec(data, xField, yField || xField);
    case 'heatmap':
      return buildHeatmapSpec(data, xField, yField || xField, colorField || yField || xField);
    case 'pie':
      return buildPieSpec(data, xField, yField || xField);
    case 'donut':
      return buildPieSpec(data, xField, yField || xField, true);
    case 'combo':
      return buildComboSpec(data, xField, yField || xField, colorField || yField || xField);
    default:
      return buildBarSpec(data, xField, yField || xField, colorField);
  }
}
