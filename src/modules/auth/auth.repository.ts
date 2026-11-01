import type { ResultSetHeader } from "mysql2";
import { db } from "../../config/database.js";
import type { AuthUserRow } from "./types.js";

export const createUser = async (email: string, passwordHash: string, name: string): Promise<number> => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO \`users\` (email, password_hash, name)
     VALUES (?, ?, ?)`,
    [email, passwordHash, name],
  );

  return result.insertId;
};

export const findByEmail = async (email: string,): Promise<AuthUserRow | null> => {
  const [rows] = await db.query<AuthUserRow[]>(
    `SELECT id, email, password_hash, name
     FROM \`users\`
     WHERE email = ?`,
    [email],
  );

  return rows[0] ?? null;
};
