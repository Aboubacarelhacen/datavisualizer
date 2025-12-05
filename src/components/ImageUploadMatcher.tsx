import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, Check, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatasetSchema } from "@/types";
import {
  analyzeChartImage,
  ImageAnalysisResult,
} from "@/lib/imageChartMatcher";
import { cn } from "@/lib/utils";

interface ImageUploadMatcherProps {
  schema: DatasetSchema | null;
  onMatchComplete?: (result: ImageAnalysisResult) => void;
}

export function ImageUploadMatcher({
  schema,
  onMatchComplete,
}: ImageUploadMatcherProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
        setResult(null);
      }
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!imageFile || !schema) {
      console.error("Missing imageFile or schema");
      return;
    }

    console.log("Starting analysis...", { imageFile, schema });
    setIsAnalyzing(true);
    
    try {
      const analysisResult = await analyzeChartImage(imageFile, schema);
      console.log("Analysis complete:", analysisResult);
      setResult(analysisResult);
      onMatchComplete?.(analysisResult);
    } catch (err) {
      console.error("Analysis error:", err);
      // Show fallback result on error
      const fallbackResult = {
        detectedType: 'bar' as const,
        confidence: 0.5,
        features: {
          hasAxes: true,
          hasBars: true,
          hasLines: false,
          hasPoints: false,
          hasPieSegments: false,
          hasLegend: true,
          estimatedSeriesCount: 1,
          estimatedCategoryCount: 5,
        },
        isCompatible: true,
        canCreate: true,
        matchMessage: '⚠️ Analysis failed, showing default recommendation',
        reason: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
      setResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, schema, onMatchComplete]);

  const handleClear = useCallback(() => {
    setImageFile(null);
    setImageUrl(null);
    setResult(null);
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed p-6 transition-all",
          imageUrl
            ? "border-border/50 bg-card/30"
            : "border-border/50 bg-card/30 hover:border-aurora-purple/50 hover:bg-card/50",
          !schema && "opacity-50 pointer-events-none"
        )}
      >
        {!imageUrl ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={!schema}
            />
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Upload a chart image</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {schema
                    ? "PNG or JPG - We'll try to match it with your data"
                    : "Load a dataset first"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imageUrl}
                alt="Uploaded chart"
                className="w-full h-[150px] object-contain rounded-lg bg-background/50"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 hover:bg-destructive/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Analyze Button */}
            {!result && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full gap-2 bg-aurora-gradient hover:opacity-90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Analyze & Match
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "rounded-xl border p-4",
              result.isCompatible
                ? "border-aurora-cyan/50 bg-aurora-cyan/5"
                : "border-destructive/50 bg-destructive/5"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  result.canCreate ? "bg-aurora-cyan/20" : "bg-destructive/20"
                )}
              >
                {result.canCreate ? (
                  <Check className="h-5 w-5 text-aurora-cyan" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    Detected:{" "}
                    <span className="text-aurora-cyan capitalize">
                      {result.detectedType || "Unknown"}
                    </span>{" "}
                    Chart
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    result.canCreate ? "text-aurora-cyan" : "text-destructive"
                  )}
                >
                  {result.matchMessage}
                </p>

                {/* Reason for failure */}
                {!result.canCreate && result.reason && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/50">
                    {result.reason}
                  </p>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {result.features.hasAxes && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                      📊 Has axes
                    </span>
                  )}
                  {result.features.hasLegend && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                      🏷️ Has legend
                    </span>
                  )}
                  {result.features.hasBars && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                      📊 Bar elements
                    </span>
                  )}
                  {result.features.hasLines && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                      📈 Line elements
                    </span>
                  )}
                  {result.features.hasPoints && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                      🔵 Scatter points
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                    ~{result.features.estimatedCategoryCount} categories
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Note */}
      <p className="text-[10px] text-muted-foreground/70 italic text-center">
        🔮 Vision AI integration for accurate detection coming soon
      </p>
    </div>
  );
}
