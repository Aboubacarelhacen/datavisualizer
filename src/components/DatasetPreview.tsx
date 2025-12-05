import { motion } from "framer-motion";
import { Dataset } from "@/types";
import {
  Table,
  Hash,
  Calendar,
  ToggleLeft,
  Type,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DatasetPreviewProps {
  dataset: Dataset;
}

export function DatasetPreview({ dataset }: DatasetPreviewProps) {
  const { schema, data } = dataset;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "number":
        return <Hash className="h-3.5 w-3.5 text-aurora-cyan" />;
      case "datetime":
        return <Calendar className="h-3.5 w-3.5 text-aurora-purple" />;
      case "boolean":
        return <ToggleLeft className="h-3.5 w-3.5 text-aurora-pink" />;
      case "string":
        return <Type className="h-3.5 w-3.5 text-aurora-teal" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Schema Summary */}
      <div className="rounded-xl bg-card/50 border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Table className="h-4 w-4 text-aurora-cyan" />
          <h3 className="font-medium text-sm">Schema</h3>
          <span className="text-xs text-muted-foreground ml-auto">
            {schema.rowCount} rows × {schema.columns.length} columns
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {schema.columns.map((col, i) => (
            <motion.div
              key={col.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-xs"
            >
              {getTypeIcon(col.type)}
              <span className="font-medium">{col.name}</span>
              <span className="text-muted-foreground">({col.type})</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Preview Table */}
      <div className="rounded-xl bg-card/50 border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Data Preview</h3>
            <span className="text-xs text-muted-foreground">First 10 rows</span>
          </div>
          <span className="text-[10px] text-muted-foreground/70">
            Scroll horizontally →
          </span>
        </div>

        <div className="relative overflow-auto max-h-[450px]">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm shadow-sm">
              <tr className="border-b-2 border-border">
                {schema.columns.map((col) => (
                  <th
                    key={col.name}
                    className="px-4 py-3 text-left font-semibold whitespace-nowrap bg-background/95"
                  >
                    <div className="flex items-center gap-2 min-w-[150px]">
                      {getTypeIcon(col.type)}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-semibold">
                          {col.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {col.type}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  className="border-b border-border/40 hover:bg-muted/40 transition-colors"
                >
                  {schema.columns.map((col) => (
                    <td
                      key={col.name}
                      className="px-4 py-3 whitespace-nowrap min-w-[150px]"
                      title={String(row[col.name] || "")}
                    >
                      {row[col.name] !== null && row[col.name] !== undefined ? (
                        <span className="text-foreground">
                          {String(row[col.name])}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 italic text-[10px]">
                          null
                        </span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
