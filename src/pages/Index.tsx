import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Layout/Header";
import { FileUpload } from "@/components/FileUpload";
import { DatasetPreview } from "@/components/DatasetPreview";
import { PromptInput } from "@/components/PromptInput";
import { ChartGallery } from "@/components/ChartGallery";
import { ChartCanvas } from "@/components/ChartCanvas";
import { InsightPanel } from "@/components/InsightPanel";
import { SpecViewer } from "@/components/SpecViewer";
import { ImageUploadMatcher } from "@/components/ImageUploadMatcher";
import { FavoritesPanel } from "@/components/FavoritesPanel";
import { ExportActions } from "@/components/ExportActions";
import { useDataset } from "@/hooks/useDataset";
import { useChartGeneration } from "@/hooks/useChartGeneration";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { Database, Sparkles, Image, Heart, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const { dataset, isLoading: datasetLoading, loadFile } = useDataset();
  const {
    recommendations,
    selectedChart,
    selectChart,
    generateFromPrompt,
    currentSpec,
    currentIntent,
    insights,
  } = useChartGeneration(dataset);
  const { history, addPrompt } = usePromptHistory();
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState("data");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");

  const handlePromptSubmit = useCallback(
    (prompt: string) => {
      if (!dataset) {
        toast({
          title: "No dataset loaded",
          description: "Please upload a dataset first",
          variant: "destructive",
        });
        return;
      }

      setIsGenerating(true);
      setLastPrompt(prompt);

      // Simulate slight delay for UX
      setTimeout(() => {
        const result = generateFromPrompt(prompt);
        addPrompt(prompt, currentIntent?.chartType);
        setIsGenerating(false);

        if (result) {
          toast({
            title: "Chart generated!",
            description: `Created a ${
              currentIntent?.chartType || "chart"
            } visualization`,
          });
        }
      }, 500);
    },
    [dataset, generateFromPrompt, addPrompt, currentIntent, toast]
  );

  const handleSaveFavorite = useCallback(
    (name: string) => {
      if (!currentSpec || !dataset) return;
      addFavorite(name, lastPrompt, currentSpec, dataset.schema.fileName);
    },
    [currentSpec, dataset, lastPrompt, addFavorite]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-aurora-cyan/5 via-transparent to-transparent animate-aurora" />
        <div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-aurora-purple/5 via-transparent to-transparent animate-aurora"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-1/2 h-1/2 bg-gradient-radial from-aurora-pink/3 via-transparent to-transparent animate-aurora"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <Header />

      <main className="relative pt-20 pb-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Data & Controls */}
            <motion.div
              className="lg:col-span-3 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-4 bg-card/50 border border-border/50">
                  <TabsTrigger
                    value="data"
                    className="data-[state=active]:bg-aurora-cyan/20 data-[state=active]:text-aurora-cyan"
                  >
                    <Database className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="prompt"
                    className="data-[state=active]:bg-aurora-purple/20 data-[state=active]:text-aurora-purple"
                  >
                    <Sparkles className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="data-[state=active]:bg-aurora-pink/20 data-[state=active]:text-aurora-pink"
                  >
                    <Image className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="data-[state=active]:bg-aurora-teal/20 data-[state=active]:text-aurora-teal"
                  >
                    <Heart className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="data" className="mt-4 space-y-4">
                  <FileUpload
                    onFileSelect={loadFile}
                    isLoading={datasetLoading}
                    currentFile={dataset?.schema.fileName}
                  />
                  {dataset && <DatasetPreview dataset={dataset} />}
                </TabsContent>

                <TabsContent value="prompt" className="mt-4">
                  <PromptInput
                    onSubmit={handlePromptSubmit}
                    isLoading={isGenerating}
                    history={history}
                    onHistorySelect={handlePromptSubmit}
                    disabled={!dataset}
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-4">
                  <ImageUploadMatcher
                    schema={dataset?.schema || null}
                    onMatchComplete={(result) => {
                      console.log("Image match result:", result);
                      console.log(
                        "Available recommendations:",
                        recommendations.map((r) => r.type)
                      );

                      if (result.canCreate && result.detectedType && dataset) {
                        // Try to find matching recommendation first
                        const match = recommendations.find(
                          (r) => r.type === result.detectedType
                        );

                        console.log(
                          "Found match in recommendations:",
                          match?.type
                        );

                        if (match) {
                          selectChart(match);
                          toast({
                            title: "✨ Chart Created!",
                            description: `Generated ${result.detectedType} chart from your image.`,
                          });
                        } else {
                          // If not in recommendations, generate it via prompt
                          console.log(
                            "Not in recommendations, trying prompt generation..."
                          );
                          const chartTypeName = result.detectedType.replace(
                            "-",
                            " "
                          );
                          const generatedSpec = generateFromPrompt(
                            `create a ${chartTypeName} chart`
                          );

                          console.log(
                            "Generated spec:",
                            generatedSpec ? "SUCCESS" : "FAILED"
                          );

                          if (generatedSpec) {
                            toast({
                              title: "✨ Chart Created!",
                              description: `Generated ${result.detectedType} chart from your image.`,
                            });
                          } else {
                            toast({
                              title: "⚠️ Chart Not Available",
                              description: `The ${result.detectedType} chart isn't in the recommendations. Try using the Prompt tab instead.`,
                              variant: "destructive",
                            });
                          }
                        }
                      } else if (!result.canCreate) {
                        toast({
                          title: "❌ Cannot Create Chart",
                          description:
                            result.reason ||
                            "Dataset is not compatible with detected chart type.",
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                </TabsContent>

                <TabsContent value="favorites" className="mt-4">
                  <FavoritesPanel
                    favorites={favorites}
                    onSelect={(fav) => {
                      // TODO: Load favorite chart
                      toast({
                        title: "Loading favorite",
                        description: fav.name,
                      });
                    }}
                    onRemove={removeFavorite}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Center - Chart Display */}
            <motion.div
              className="lg:col-span-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="glass-card p-6 min-h-[500px]">
                {/* Chart Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-aurora-cyan" />
                    <h2 className="font-semibold">
                      {selectedChart?.title ||
                        currentIntent?.chartType ||
                        "Chart Visualization"}
                    </h2>
                  </div>
                  <ExportActions
                    spec={currentSpec}
                    onSaveFavorite={handleSaveFavorite}
                  />
                </div>

                {/* Chart Canvas */}
                <div className="relative h-[400px] rounded-xl bg-background/50 border border-border/30">
                  <ChartCanvas
                    spec={currentSpec}
                    className="absolute inset-0 p-4"
                  />
                </div>

                {/* Quick Prompt Bar (shown when dataset is loaded) */}
                <AnimatePresence>
                  {dataset && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-4 lg:hidden"
                    >
                      <PromptInput
                        onSubmit={handlePromptSubmit}
                        isLoading={isGenerating}
                        history={history}
                        onHistorySelect={handlePromptSubmit}
                        disabled={!dataset}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spec Viewer (collapsed by default on mobile) */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <SpecViewer spec={currentSpec} />
              </motion.div>
            </motion.div>

            {/* Right Sidebar - Recommendations & Insights */}
            <motion.div
              className="lg:col-span-3 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Chart Gallery */}
              <div className="glass-card p-4">
                <ChartGallery
                  recommendations={recommendations}
                  selectedChart={selectedChart}
                  onSelectChart={selectChart}
                />
              </div>

              {/* Insights Panel */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <InsightPanel insights={insights} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/30 py-6 px-4">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>Aurora Vibe Charts — AI Data & Chart Assistant</p>
          <div className="flex items-center gap-4">
            <span>Built with Vega-Lite</span>
            <span>•</span>
            <span>Supports Turkish & English</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
