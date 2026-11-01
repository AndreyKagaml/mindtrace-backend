import { db } from "../../config/database.js";
import type { UserRow, UserPasswordRow } from "./types.js";

export const findById = async (userId: number): Promise<UserRow | null> => {
  const [rows] = await db.query<UserRow[]>(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = ?`,
    [userId],
  );

  return rows[0] ?? null;
};

export const update = async (
  userId: number,
  name?: string,
  email?: string,
): Promise<void> => {
  await db.query(
    `UPDATE users
     SET name = COALESCE(?, name),
         email = COALESCE(?, email)
     WHERE id = ?`,
    [name ?? null, email ?? null, userId],
  );
};

export const findPasswordHash = async (
  userId: number,
): Promise<string | null> => {
  const [rows] = await db.query<UserPasswordRow[]>(
    `SELECT password_hash
     FROM users
     WHERE id = ?`,
    [userId],
  );

  return rows[0]?.password_hash ?? null;
};

export const updatePasswordHash = async (
  userId: number,
  passwordHash: string,
): Promise<void> => {
  await db.execute(
    `UPDATE users
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, userId],
  );
};