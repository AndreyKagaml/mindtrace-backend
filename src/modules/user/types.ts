import type { RowDataPacket } from "mysql2";

export interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface UserPasswordRow extends RowDataPacket {
  password_hash: string;
}
