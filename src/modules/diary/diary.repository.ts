import type { ResultSetHeader } from "mysql2";
import { db } from "../../config/database.js";

import type { DiaryEntry, DiaryEntryRow } from "./types.js";
import { mapDiaryEntry } from "./utils.js";

export const findByDate = async (
  userId: number,
  date: string,
): Promise<DiaryEntry[]> => {
  const [rows] = await db.execute<DiaryEntryRow[]>(
    `SELECT
      id,
      user_id,
      DATE_FORMAT(entry_date, '%Y-%m-%d') AS entry_date,
      content,
      created_at,
      updated_at
     FROM diary
     WHERE user_id = ? AND entry_date = ?
     ORDER BY created_at ASC, id ASC`,
    [userId, date],
  );

  return rows.map(mapDiaryEntry);
};

export const findById = async (
  userId: number,
  entryId: number,
): Promise<DiaryEntry | null> => {
  const [rows] = await db.execute<DiaryEntryRow[]>(
    `SELECT
        id,
        user_id,
        DATE_FORMAT(entry_date, '%Y-%m-%d') AS entry_date,
        content,
        created_at,
        updated_at
     FROM diary
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [entryId, userId],
  );

  return rows[0] ? mapDiaryEntry(rows[0]) : null;
};

export const create = async (
  userId: number,
  date: string,
  text: string,
): Promise<DiaryEntry> => {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO diary (user_id, entry_date, content)
     VALUES (?, ?, ?)`,
    [userId, date, text],
  );

  const entry = await findById(userId, result.insertId);

  if (!entry) {
    throw new Error("Failed to retrieve created diary entry");
  }

  return entry;
};

export const update = async (
  userId: number,
  entryId: number,
  text: string,
): Promise<DiaryEntry | null> => {
  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE diary
     SET content = ?
     WHERE id = ?
       AND user_id = ?
       AND entry_date = CURRENT_DATE()`,
    [text, entryId, userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return findById(userId, entryId);
};

export const remove = async (
  userId: number,
  entryId: number,
): Promise<boolean> => {
  const [result] = await db.execute<ResultSetHeader>(
    `DELETE FROM diary
     WHERE id = ?
       AND user_id = ?
       AND entry_date = CURRENT_DATE()`,
    [entryId, userId],
  );

  return result.affectedRows > 0;
};

