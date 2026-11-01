import type { RowDataPacket } from "mysql2";

export interface ChatSession {
  id: number;
  user_id: number;
  chat_date: string;
  is_closed: boolean;
  analysis: string | null;
}

export interface ChatMessage {
  id: number;
  chat_session_id: number;
  sender: "user" | "psychologist";
  message: string;
  created_at: string;
}

export interface ChatSessionRow extends RowDataPacket, ChatSession {}

export interface ChatMessageRow extends RowDataPacket, ChatMessage {}

export interface ChatSessionResult {
  sessionId: number | null;
  isClosed: boolean;
  analysis: string | null;
  messages: ChatMessage[];
}

export interface TodaySessionResult {
  sessionId: number;
  isClosed: boolean;
  created: boolean;
}