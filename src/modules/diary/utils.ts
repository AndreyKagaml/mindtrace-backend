import type { DiaryEntryRow, DiaryEntry } from "./types.js";

export const parseEntryId = (value: string): number | null => {
  if (!/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
};

export const mapDiaryEntry = (row: DiaryEntryRow): DiaryEntry => ({
  id: Number(row.id),
  date: String(row.entry_date).slice(0, 10),
  text: row.content,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});