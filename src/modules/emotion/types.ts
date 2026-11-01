import type { RowDataPacket } from "mysql2";

export interface EmotionData {
  joy: number;
  sadness: number;
  fear: number;
  anger: number;
  surprise: number;
}

export interface EmotionRow extends RowDataPacket, EmotionData {
  id: number;
  user_id: number;
  record_date: string;
}

export interface EmotionRow extends RowDataPacket, EmotionData {}

export interface EmotionHistoryItem extends RowDataPacket, EmotionData {
  record_date: string;
}

export interface EmotionChartRow extends RowDataPacket {
  record_date: string;
  joy: number;
  sadness: number;
  fear: number;
  anger: number;
  surprise: number;
}