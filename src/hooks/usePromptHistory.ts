import { useState, useCallback, useEffect } from 'react';
import { PromptHistoryItem } from '@/types';

const STORAGE_KEY = 'aurora-vibe-prompt-history';
const MAX_HISTORY = 20;

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.map((item: PromptHistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        })));
      }
    } catch (err) {
      console.error('Failed to load prompt history:', err);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save prompt history:', err);
    }
  }, [history]);

  const addPrompt = useCallback((prompt: string, chartType?: string) => {
    const newItem: PromptHistoryItem = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
      chartType: chartType as PromptHistoryItem['chartType'],
    };

    setHistory(prev => {
      // Remove duplicates and add new item at the beginning
      const filtered = prev.filter(item => item.prompt !== prompt);
      return [newItem, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    history,
    addPrompt,
    clearHistory,
    removeItem,
  };
}
