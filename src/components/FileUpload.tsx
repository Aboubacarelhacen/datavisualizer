import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, FileJson, File, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  currentFile?: string;
}

export function FileUpload({ onFileSelect, isLoading, currentFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-aurora-cyan" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5 text-aurora-teal" />;
      case 'json':
        return <FileJson className="h-5 w-5 text-aurora-purple" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-6 transition-all duration-300',
          isDragging 
            ? 'border-aurora-cyan bg-aurora-cyan/5' 
            : 'border-border/50 bg-card/30 hover:border-border hover:bg-card/50',
          isLoading && 'pointer-events-none opacity-50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div 
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-xl',
              isDragging ? 'bg-aurora-cyan/20' : 'bg-muted/50'
            )}
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          >
            <Upload className={cn(
              'h-6 w-6 transition-colors',
              isDragging ? 'text-aurora-cyan' : 'text-muted-foreground'
            )} />
          </motion.div>
          
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? 'Drop your file here' : 'Upload your dataset'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              CSV, Excel, or JSON files supported
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current file indicator */}
      <AnimatePresence>
        {currentFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl bg-card/50 border border-border/50 px-4 py-3"
          >
            {getFileIcon(currentFile)}
            <span className="flex-1 truncate text-sm font-medium">{currentFile}</span>
            <Check className="h-4 w-4 text-aurora-cyan" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
