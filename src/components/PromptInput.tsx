import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PromptHistoryItem } from '@/types';
import { EXAMPLE_PROMPTS } from '@/lib/promptParser';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  history: PromptHistoryItem[];
  onHistorySelect: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptInput({ 
  onSubmit, 
  isLoading, 
  history, 
  onHistorySelect,
  disabled 
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = useCallback(() => {
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  }, [prompt, isLoading, disabled, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const allExamples = [...EXAMPLE_PROMPTS.turkish, ...EXAMPLE_PROMPTS.english];

  return (
    <div className="space-y-3">
      {/* Example prompts */}
      {!disabled && prompt.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Try an example</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allExamples.slice(0, 4).map((example, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setPrompt(example)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-aurora-cyan/30 text-muted-foreground hover:text-foreground transition-all truncate max-w-[180px]"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Prompt Input */}
      <div className={cn(
        'prompt-input relative rounded-xl border border-border/50 bg-card/50 transition-all',
        disabled ? 'opacity-50' : 'focus-within:border-aurora-cyan/50 focus-within:bg-card/80'
      )}>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled 
            ? 'Upload a dataset first to start creating charts...' 
            : 'Describe the chart you want to create... (TR or EN)'
          }
          disabled={disabled || isLoading}
          className="min-h-[80px] resize-none border-0 bg-transparent p-4 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
        />
        
        <div className="flex items-center justify-between px-3 pb-3">
          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            disabled={history.length === 0}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              history.length > 0 
                ? 'text-muted-foreground hover:text-foreground' 
                : 'text-muted-foreground/50 cursor-not-allowed'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>History ({history.length})</span>
          </button>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading || disabled}
            size="sm"
            className="gap-2 bg-aurora-gradient hover:opacity-90 text-primary-foreground"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>
      </div>

      {/* History Dropdown */}
      {showHistory && history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
            <span className="text-xs font-medium">Recent Prompts</span>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="max-h-[150px] overflow-y-auto">
            {history.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onHistorySelect(item.prompt);
                  setPrompt(item.prompt);
                  setShowHistory(false);
                }}
                className="w-full px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors border-b border-border/30 last:border-0"
              >
                <p className="truncate text-foreground">{item.prompt}</p>
                <p className="text-muted-foreground/70 text-[10px] mt-0.5">
                  {item.timestamp.toLocaleTimeString()}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
