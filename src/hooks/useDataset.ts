import { useState, useCallback } from 'react';
import { Dataset } from '@/types';
import { parseFile } from '@/lib/datasetAnalyzer';
import { useToast } from '@/hooks/use-toast';

export function useDataset() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await parseFile(file);
      setDataset(result);
      toast({
        title: 'Dataset loaded',
        description: `Loaded ${result.schema.rowCount} rows with ${result.schema.columns.length} columns`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse file';
      setError(message);
      toast({
        title: 'Error loading file',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearDataset = useCallback(() => {
    setDataset(null);
    setError(null);
  }, []);

  return {
    dataset,
    isLoading,
    error,
    loadFile,
    clearDataset,
  };
}
