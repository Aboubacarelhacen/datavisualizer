import { ChartType, DatasetSchema } from '@/types';

/**
 * Stub for image-based chart matching
 * In production, this would use a vision model to detect chart types from images
 */

export interface ImageAnalysisResult {
  detectedType: ChartType | null;
  confidence: number;
  features: {
    hasAxes: boolean;
    hasBars: boolean;
    hasLines: boolean;
    hasPoints: boolean;
    hasPieSegments: boolean;
    hasLegend: boolean;
    estimatedSeriesCount: number;
    estimatedCategoryCount: number;
  };
  isCompatible: boolean;
  matchMessage: string;
  canCreate: boolean;
  reason?: string;
}

/**
 * Basic image analysis to detect chart type
 * Uses image processing to identify visual patterns
 */
async function detectChartTypeFromImage(imageFile: File): Promise<{ type: ChartType; confidence: number; features: any }> {
  return new Promise((resolve, reject) => {
    console.log('Loading image for analysis...');
    
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('Image analysis timeout');
      resolve({ type: 'bar', confidence: 0.5, features: { hasBars: true, hasAxes: true } });
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      console.log('Image loaded, analyzing...', { width: img.width, height: img.height });
      
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          console.warn('Failed to get image data');
          resolve({ type: 'bar', confidence: 0.5, features: { hasBars: true, hasAxes: true } });
          return;
        }
      
      // Analyze image characteristics
      const { data, width, height } = imageData;
      
      // Check for circular patterns (pie/donut charts)
      let circularScore = 0;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 3;
      
      // Sample points in circular pattern
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        for (let r = maxRadius * 0.3; r < maxRadius; r += 10) {
          const x = Math.floor(centerX + r * Math.cos(angle));
          const y = Math.floor(centerY + r * Math.sin(angle));
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            if (brightness > 50 && brightness < 240) circularScore++;
          }
        }
      }
      
      // Check for vertical patterns (bar charts)
      let verticalScore = 0;
      for (let x = 0; x < width; x += 20) {
        let hasVertical = false;
        for (let y = height * 0.2; y < height * 0.8; y += 10) {
          const idx = (Math.floor(y) * width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          if (brightness > 50 && brightness < 240) {
            hasVertical = true;
            break;
          }
        }
        if (hasVertical) verticalScore++;
      }
      
      // Check for line patterns
      let lineScore = 0;
      for (let y = height * 0.2; y < height * 0.8; y += 20) {
        let consecutivePixels = 0;
        for (let x = 0; x < width; x++) {
          const idx = (Math.floor(y) * width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          if (brightness > 50 && brightness < 240) {
            consecutivePixels++;
          } else {
            if (consecutivePixels > width * 0.3) lineScore++;
            consecutivePixels = 0;
          }
        }
      }
      
        // Determine chart type based on scores
        console.log('Pattern scores:', { circularScore, verticalScore, lineScore });
        
        const scores = [
          { type: 'pie' as ChartType, score: circularScore, features: { hasPieSegments: true, hasAxes: false } },
          { type: 'bar' as ChartType, score: verticalScore, features: { hasBars: true, hasAxes: true } },
          { type: 'line' as ChartType, score: lineScore, features: { hasLines: true, hasAxes: true } },
        ];
        
        scores.sort((a, b) => b.score - a.score);
        const detected = scores[0];
        const confidence = Math.min(0.95, 0.6 + (detected.score / 100));
        
        console.log('Detected chart type:', detected.type, 'confidence:', confidence);
        
        resolve({
          type: detected.type,
          confidence,
          features: detected.features,
        });
      } catch (error) {
        console.error('Error during image analysis:', error);
        clearTimeout(timeout);
        resolve({ type: 'bar', confidence: 0.5, features: { hasBars: true, hasAxes: true } });
      }
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.error('Failed to load image:', error);
      resolve({ type: 'bar', confidence: 0.5, features: { hasBars: true, hasAxes: true } });
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
}

/**
 * Analyzes image and compares with dataset schema
 */
export async function analyzeChartImage(
  imageFile: File,
  schema: DatasetSchema
): Promise<ImageAnalysisResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Detect chart type from image
  const detection = await detectChartTypeFromImage(imageFile);
  const detectedType = detection.type;
  const confidence = detection.confidence;
  
  const features = {
    hasAxes: detection.features.hasAxes ?? detectedType !== 'pie',
    hasBars: detection.features.hasBars ?? detectedType === 'bar',
    hasLines: detection.features.hasLines ?? (detectedType === 'line' || detectedType === 'area'),
    hasPoints: detectedType === 'scatter',
    hasPieSegments: detection.features.hasPieSegments ?? detectedType === 'pie',
    hasLegend: true,
    estimatedSeriesCount: 2,
    estimatedCategoryCount: 5,
  };
  
  // Check compatibility with dataset
  const numericColumns = schema.columns.filter(c => c.type === 'number');
  const categoricalColumns = schema.columns.filter(c => c.type === 'string' && c.uniqueCount < 50);
  const dateColumns = schema.columns.filter(c => c.type === 'datetime');
  
  console.log('Schema analysis:', {
    detectedType,
    numericColumns: numericColumns.length,
    categoricalColumns: categoricalColumns.length,
    dateColumns: dateColumns.length,
  });
  
  let isCompatible = true;
  let canCreate = true;
  let matchMessage = '';
  let reason = '';
  
  switch (detectedType) {
    case 'bar':
      isCompatible = numericColumns.length >= 1 && categoricalColumns.length >= 1;
      canCreate = isCompatible;
      matchMessage = isCompatible 
        ? '✅ Perfect match! Creating a bar chart for you...'
        : '❌ Cannot create this chart type.';
      reason = !isCompatible 
        ? `Your dataset has ${numericColumns.length} numeric and ${categoricalColumns.length} categorical columns. Need at least 1 of each.`
        : '';
      break;
    case 'line':
    case 'area':
      // Allow line/area charts with either datetime OR categorical x-axis
      isCompatible = numericColumns.length >= 1 && (dateColumns.length >= 1 || categoricalColumns.length >= 1);
      canCreate = isCompatible;
      matchMessage = isCompatible
        ? '✅ Perfect match! Creating a trend chart for you...'
        : '❌ Cannot create this chart type.';
      reason = !isCompatible
        ? `Your dataset has ${numericColumns.length} numeric, ${dateColumns.length} date, and ${categoricalColumns.length} categorical columns. Need at least 1 numeric and 1 date/category column.`
        : '';
      break;
    case 'scatter':
      isCompatible = numericColumns.length >= 2;
      canCreate = isCompatible;
      matchMessage = isCompatible
        ? '✅ Perfect match! Creating a scatter plot for you...'
        : '❌ Cannot create this chart type.';
      reason = !isCompatible
        ? `Your dataset has ${numericColumns.length} numeric columns. Need at least 2 numeric columns.`
        : '';
      break;
    case 'pie':
      isCompatible = numericColumns.length >= 1 && categoricalColumns.length >= 1;
      canCreate = isCompatible;
      matchMessage = isCompatible
        ? '✅ Perfect match! Creating a pie chart for you...'
        : '❌ Cannot create this chart type.';
      reason = !isCompatible
        ? `Your dataset has ${numericColumns.length} numeric and ${categoricalColumns.length} categorical columns. Need at least 1 of each.`
        : '';
      break;
    default:
      canCreate = false;
      matchMessage = '⚠️ Chart type not yet supported.';
      reason = `Detected chart type "${detectedType}" is not currently supported.`;
  }
  
  console.log('Final result:', { detectedType, canCreate, matchMessage, reason });
  
  return {
    detectedType,
    confidence,
    features,
    isCompatible,
    canCreate,
    matchMessage,
    reason,
  };
}

/**
 * TODO: Production Image Analysis Integration
 * 
 * async function analyzeChartImageWithVision(
 *   imageFile: File,
 *   schema: DatasetSchema
 * ): Promise<ImageAnalysisResult> {
 *   // Convert image to base64
 *   const base64 = await fileToBase64(imageFile);
 *   
 *   // Call vision model
 *   const response = await callVisionModel({
 *     image: base64,
 *     prompt: `Analyze this chart image and identify:
 *       1. Chart type (bar, line, pie, scatter, area, etc.)
 *       2. Whether it has axes, legend
 *       3. Approximate number of data series
 *       4. Approximate number of categories/data points
 *       
 *       Return as JSON with confidence scores.`
 *   });
 *   
 *   // Parse response and check compatibility
 *   const analysis = JSON.parse(response);
 *   return {
 *     detectedType: analysis.chartType,
 *     confidence: analysis.confidence,
 *     features: analysis.features,
 *     isCompatible: checkCompatibility(analysis, schema),
 *     matchMessage: generateMatchMessage(analysis, schema),
 *   };
 * }
 */
