import type { RowDataPacket } from "mysql2";

export interface DiaryEntryRow extends RowDataPacket {
  id: number;
  user_id: number;
  entry_date: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface DiaryEntry {
  id: number;
  date: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}