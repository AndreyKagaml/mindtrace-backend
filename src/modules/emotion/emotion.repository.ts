import { db } from "../../config/database.js";
import type { ResultSetHeader } from "mysql2";
import type {
  EmotionChartRow,
  EmotionData,
  EmotionHistoryItem,
  EmotionRow,
} from "./types.js";

export const findTodayByUserId = async (userId: number): Promise<EmotionRow | null> => {
  const [rows] = await db.query<EmotionRow[]>(
    `SELECT joy, sadness, fear, anger, surprise
     FROM emotions
     WHERE user_id = ? AND record_date = CURRENT_DATE
     LIMIT 1`,
    [userId],
  );

  return rows[0] ?? null;
};

export const createForUser = async (userId: number, data: EmotionData): Promise<ResultSetHeader> => {
  const { joy, sadness, fear, anger, surprise } = data;

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO emotions (
       user_id,
       record_date,
       joy,
       sadness,
       fear,
       anger,
       surprise
     ) VALUES (?, CURRENT_DATE, ?, ?, ?, ?, ?)`,
    [userId, joy, sadness, fear, anger, surprise],
  );

  return result;
};

export const updateTodayByUserId = async (userId: number, data: EmotionData): Promise<ResultSetHeader> => {
  const { joy, sadness, fear, anger, surprise } = data;

  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE emotions
     SET
       joy = ?,
       sadness = ?,
       fear = ?,
       anger = ?,
       surprise = ?
     WHERE user_id = ? AND record_date = CURRENT_DATE`,
    [joy, sadness, fear, anger, surprise, userId],
  );

  return result;
};

export const findMonthHistoryByUserId = async (userId: number, year: string, month: string): Promise<EmotionHistoryItem[]> => {
  const [rows] = await db.query<EmotionHistoryItem[]>(
    `SELECT
       record_date,
       joy,
       sadness,
       fear,
       anger,
       surprise
     FROM emotions
     WHERE user_id = ?
       AND YEAR(record_date) = ?
       AND MONTH(record_date) = ?
     ORDER BY record_date ASC`,
    [userId, year, month],
  );

  return rows;
};

export const findChartDataByUserId = async (userId: number, limit: number): Promise<EmotionChartRow[]> => {
  const [rows] = await db.query<EmotionChartRow[]>(
    `SELECT
       DATE_FORMAT(record_date, '%Y-%m-%d') AS record_date,
       joy,
       sadness,
       fear,
       anger,
       surprise
     FROM emotions
     WHERE user_id = ?
     ORDER BY record_date DESC
     LIMIT ?`,
    [userId, limit],
  );

  return rows.reverse();
};