import { ColumnSchema, ColumnType, Dataset, DatasetSchema } from '@/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Analyzes a dataset and infers column types
 */

function inferColumnType(values: unknown[]): ColumnType {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'unknown';
  
  // Check if all values are booleans
  const booleanValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || 
    v === 'true' || v === 'false' || 
    v === 'True' || v === 'False' ||
    v === '0' || v === '1'
  );
  if (booleanValues.length === nonNullValues.length && nonNullValues.length > 0) {
    return 'boolean';
  }
  
  // Check if all values are numbers
  const numericValues = nonNullValues.filter(v => {
    if (typeof v === 'number') return !isNaN(v);
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/,/g, ''));
      return !isNaN(parsed);
    }
    return false;
  });
  if (numericValues.length === nonNullValues.length) {
    return 'number';
  }
  
  // Check if values look like dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // ISO format
    /^\d{2}\/\d{2}\/\d{4}/, // US format
    /^\d{2}\.\d{2}\.\d{4}/, // EU format
    /^\d{4}\/\d{2}\/\d{2}/, // Japan format
  ];
  
  const dateValues = nonNullValues.filter(v => {
    if (v instanceof Date) return true;
    if (typeof v === 'string') {
      return datePatterns.some(pattern => pattern.test(v)) || !isNaN(Date.parse(v));
    }
    return false;
  });
  if (dateValues.length > nonNullValues.length * 0.8) {
    return 'datetime';
  }
  
  return 'string';
}

function analyzeColumn(name: string, values: unknown[]): ColumnSchema {
  const type = inferColumnType(values);
  const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
  const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined && v !== ''));
  
  // Get sample values (up to 5 unique non-null values)
  const sampleValues = Array.from(uniqueValues).slice(0, 5).map(v => {
    if (type === 'number' && typeof v === 'string') {
      return parseFloat(v.replace(/,/g, ''));
    }
    return v as string | number | boolean | null;
  });
  
  return {
    name,
    type,
    sampleValues,
    uniqueCount: uniqueValues.size,
    nullCount,
    nullRatio: values.length > 0 ? nullCount / values.length : 0,
  };
}

export function analyzeDataset(data: Record<string, unknown>[], fileName: string, fileType: 'csv' | 'json' | 'xlsx'): DatasetSchema {
  if (data.length === 0) {
    return {
      columns: [],
      rowCount: 0,
      fileName,
      fileType,
    };
  }
  
  const columnNames = Object.keys(data[0]);
  const columns = columnNames.map(name => {
    const values = data.map(row => row[name]);
    return analyzeColumn(name, values);
  });
  
  return {
    columns,
    rowCount: data.length,
    fileName,
    fileType,
  };
}

export async function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, unknown>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parseExcel(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData as Record<string, unknown>[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

export async function parseJSON(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Handle both array and object with data property
        const arrayData = Array.isArray(data) ? data : (data.data || [data]);
        resolve(arrayData as Record<string, unknown>[]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function parseFile(file: File): Promise<Dataset> {
  const fileName = file.name;
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  let data: Record<string, unknown>[];
  let fileType: 'csv' | 'json' | 'xlsx';
  
  switch (extension) {
    case 'csv':
      data = await parseCSV(file);
      fileType = 'csv';
      break;
    case 'xlsx':
    case 'xls':
      data = await parseExcel(file);
      fileType = 'xlsx';
      break;
    case 'json':
      data = await parseJSON(file);
      fileType = 'json';
      break;
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
  
  const schema = analyzeDataset(data, fileName, fileType);
  
  return { data, schema };
}

export function getNumericColumns(schema: DatasetSchema): ColumnSchema[] {
  return schema.columns.filter(col => col.type === 'number');
}

export function getCategoricalColumns(schema: DatasetSchema): ColumnSchema[] {
  return schema.columns.filter(col => col.type === 'string' && col.uniqueCount < 50);
}

export function getDateColumns(schema: DatasetSchema): ColumnSchema[] {
  return schema.columns.filter(col => col.type === 'datetime');
}
