export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type AngleModeValue = "DEG" | "RAD";
