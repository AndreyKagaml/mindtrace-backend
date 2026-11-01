import type { RowDataPacket } from "mysql2";

export interface AuthUserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
  name: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}