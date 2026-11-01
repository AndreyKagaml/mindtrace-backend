
import type { ResultSetHeader } from "mysql2";
import { db } from "../../config/database.js";
import { normalizeDate } from "./utils.js";
import type {
  ChatMessage,
  ChatMessageRow,
  ChatSession,
  ChatSessionRow,
} from "./types.js";

export const findSessionByDate = async (
  userId: number,
  date: string,
): Promise<ChatSession | null> => {
  const [rows] = await db.query<ChatSessionRow[]>(
    `SELECT
       id,
       user_id,
       DATE_FORMAT(chat_date, '%Y-%m-%d') AS chat_date,
       is_closed,
       analysis
     FROM chat_sessions
     WHERE user_id = ? AND chat_date = ?
     LIMIT 1`,
    [userId, date],
  );

  return rows[0] ?? null;
};

export const findSessionById = async (
  sessionId: number,
  userId: number,
): Promise<ChatSession | null> => {
  const [rows] = await db.query<ChatSessionRow[]>(
    `SELECT
       id,
       user_id,
       DATE_FORMAT(chat_date, '%Y-%m-%d') AS chat_date,
       is_closed,
       analysis
     FROM chat_sessions
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [sessionId, userId],
  );

  return rows[0] ?? null;
};

export const findMessagesBySessionId = async (
  sessionId: number,
): Promise<ChatMessage[]> => {
  const [rows] = await db.query<ChatMessageRow[]>(
    `SELECT id, chat_session_id, sender, message, created_at
     FROM chat_messages
     WHERE chat_session_id = ?
     ORDER BY created_at ASC, id ASC`,
    [sessionId],
  );

  return rows;
};

export const closeExpiredSessions = async (
  userId: number,
  today: string,
): Promise<void> => {
  await db.execute(
    `UPDATE chat_sessions
     SET is_closed = TRUE,
         closed_at = CURRENT_TIMESTAMP
     WHERE user_id = ?
       AND chat_date < ?
       AND is_closed = FALSE`,
    [userId, today],
  );
};

export const createSession = async (
  userId: number,
  today: string,
): Promise<number> => {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO chat_sessions (user_id, chat_date)
     VALUES (?, ?)`,
    [userId, today],
  );

  return result.insertId;
};

// Сохраняет заключительный ответ и закрывает сессию одной транзакцией.
export const closeSession = async (
  sessionId: number,
  userId: number,
  today: string,
  analysis: string,
): Promise<void> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<ChatSessionRow[]>(
      `SELECT
         id,
         user_id,
         DATE_FORMAT(chat_date, '%Y-%m-%d') AS chat_date,
         is_closed,
         analysis
       FROM chat_sessions
       WHERE id = ? AND user_id = ?
       FOR UPDATE`,
      [sessionId, userId],
    );

    const session = rows[0];

    if (!session) {
      throw Object.assign(new Error("Chat session not found"), {
        statusCode: 404,
      });
    }

    if (
      normalizeDate(session.chat_date) !== today ||
      Boolean(session.is_closed)
    ) {
      throw Object.assign(new Error("Chat session is already closed"), {
        statusCode: 409,
      });
    }

    await connection.execute(
      `INSERT INTO chat_messages (chat_session_id, sender, message)
       VALUES (?, 'psychologist', ?)`,
      [sessionId, analysis],
    );

    await connection.execute(
      `UPDATE chat_sessions
       SET is_closed = TRUE,
           analysis = ?,
           closed_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [analysis, sessionId, userId],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Сохраняет сообщение только в активную сессию владельца.
export const saveMessage = async (
  sessionId: number,
  userId: number,
  today: string,
  message: string,
  sender: "user" | "psychologist",
): Promise<void> => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<ChatSessionRow[]>(
      `SELECT
         id,
         user_id,
         DATE_FORMAT(chat_date, '%Y-%m-%d') AS chat_date,
         is_closed,
         analysis
       FROM chat_sessions
       WHERE id = ? AND user_id = ?
       FOR UPDATE`,
      [sessionId, userId],
    );

    const session = rows[0];

    if (!session) {
      throw Object.assign(new Error("Chat session not found"), {
        statusCode: 404,
      });
    }

    if (
      normalizeDate(session.chat_date) !== today ||
      Boolean(session.is_closed)
    ) {
      throw Object.assign(new Error("Chat session is closed"), {
        statusCode: 409,
      });
    }

    await connection.execute(
      `INSERT INTO chat_messages (chat_session_id, sender, message)
       VALUES (?, ?, ?)`,
      [sessionId, sender, message],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
