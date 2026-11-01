import * as chatRepository from "./chat.repository.js";
import type { ChatMessage, ChatSession, ChatSessionResult, TodaySessionResult } from "./types.js";
import {
  SYSTEM_PROMPT,
  MODEL,
  client,
  FINAL_SYSTEM_PROMPT,
} from "./constants.js";
import { getTodayDate } from "../../shared/utils.js";

const createChatError = (message: string, statusCode: number) =>
  Object.assign(new Error(message), { statusCode });

const isDuplicateEntryError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "ER_DUP_ENTRY";

// Проверка существования и доступности сессии.
const getActiveSession = async (
  sessionId: number,
  userId: number,
  today: string,
): Promise<ChatSession> => {
  const session = await chatRepository.findSessionById(sessionId, userId);

  if (!session) {
    throw createChatError("Chat session not found.", 404);
  }

  if (session.chat_date !== today || Boolean(session.is_closed)) {
    throw createChatError("This chat session is closed.", 409);
  }

  return session;
};

// Формирование истории для ИИ.
const buildChatHistory = (history: ChatMessage[]) => [
  {
    role: "system" as const,
    content: SYSTEM_PROMPT,
  },
  ...history.map((item) => ({
    role:
      item.sender === "psychologist"
        ? ("assistant" as const)
        : ("user" as const),
    content: item.message,
  })),
];

// Получение чата за конкретную дату.
export const getChatByDate = async (
  userId: number,
  date: string,
): Promise<ChatSessionResult> => {
  const today = getTodayDate();

  await chatRepository.closeExpiredSessions(userId, today);

  const session = await chatRepository.findSessionByDate(userId, date);

  if (!session) {
    return {
      sessionId: null,
      isClosed: date !== today,
      analysis: null,
      messages: [],
    };
  }

  const messages = await chatRepository.findMessagesBySessionId(session.id);

  return {
    sessionId: session.id,
    isClosed: Boolean(session.is_closed),
    analysis: session.analysis,
    messages,
  };
};

// Получение существующей или создание сегодняшней сессии.
export const getOrCreateTodaySession = async (
  userId: number,
): Promise<TodaySessionResult> => {
  const today = getTodayDate();

  await chatRepository.closeExpiredSessions(userId, today);

  const existingSession = await chatRepository.findSessionByDate(
    userId,
    today,
  );

  if (existingSession) {
    return {
      sessionId: existingSession.id,
      isClosed: Boolean(existingSession.is_closed),
      created: false,
    };
  }

  try {
    const sessionId = await chatRepository.createSession(userId, today);

    return {
      sessionId,
      isClosed: false,
      created: true,
    };
  } catch (error) {
    // Защита от одновременного создания двух сессий.
    if (isDuplicateEntryError(error)) {
      const session = await chatRepository.findSessionByDate(userId, today);

      if (session) {
        return {
          sessionId: session.id,
          isClosed: Boolean(session.is_closed),
          created: false,
        };
      }
    }

    throw error;
  }
};

// Отправка сообщения пользователя и получение ответа ИИ.
export const sendChatMessage = async (
  sessionId: number,
  userId: number,
  message: string,
) => {
  const today = getTodayDate();

  await chatRepository.closeExpiredSessions(userId, today);
  await getActiveSession(sessionId, userId, today);

  // Сначала сохраняем сообщение пользователя.
  await chatRepository.saveMessage(
    sessionId,
    userId,
    today,
    message,
    "user",
  );

  // Получаем историю вместе с новым сообщением.
  const history = await chatRepository.findMessagesBySessionId(sessionId);

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: buildChatHistory(history),
  });

  const aiMessage = completion.choices[0]?.message?.content?.trim();

  if (!aiMessage) {
    throw new Error("AI returned an empty response.");
  }

  // Сохраняем ответ ИИ отдельной записью.
  await chatRepository.saveMessage(
    sessionId,
    userId,
    today,
    aiMessage,
    "psychologist",
  );

  return {
    userMessage: {
      sender: "user" as const,
      message,
    },
    aiMessage: {
      sender: "psychologist" as const,
      message: aiMessage,
    },
  };
};

// Генерация заключения и закрытие сессии.
export const closeChat = async (
  sessionId: number,
  userId: number,
) => {
  const today = getTodayDate();

  await chatRepository.closeExpiredSessions(userId, today);
  await getActiveSession(sessionId, userId, today);

  const history = await chatRepository.findMessagesBySessionId(sessionId);

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      ...buildChatHistory(history),
      {
        role: "user",
        content: FINAL_SYSTEM_PROMPT,
      },
    ],
  });

  const finalMessage = completion.choices[0]?.message?.content?.trim();

  if (!finalMessage) {
    throw new Error("AI returned an empty conclusion.");
  }

  // Репозиторий повторно проверяет сессию под блокировкой
  // и атомарно сохраняет заключение с закрытием.
  await chatRepository.closeSession(
    sessionId,
    userId,
    today,
    finalMessage,
  );

  return {
    isClosed: true,
    analysis: finalMessage,
    finalMessage,
  };
};

// Совместимость со старыми методами сервиса.
export const getChatSessionByDate = (
  userId: number,
  date: string,
): Promise<ChatSession | null> =>
  chatRepository.findSessionByDate(userId, date);

export const getChatSessionById = (
  sessionId: number,
  userId: number,
): Promise<ChatSession | null> =>
  chatRepository.findSessionById(sessionId, userId);

export const getChatMessages = (
  sessionId: number,
): Promise<ChatMessage[]> =>
  chatRepository.findMessagesBySessionId(sessionId);

export const closeExpiredChatSessions = async (
  userId: number,
  today: string,
): Promise<void> => {
  await chatRepository.closeExpiredSessions(userId, today);
};

export const createTodayChatSession = (
  userId: number,
  today: string,
): Promise<number> =>
  chatRepository.createSession(userId, today);

export const closeChatSession = (
  sessionId: number,
  userId: number,
  today: string,
  analysis: string,
): Promise<void> =>
  chatRepository.closeSession(sessionId, userId, today, analysis);

export const saveUserChatMessage = (
  sessionId: number,
  userId: number,
  today: string,
  message: string,
): Promise<void> =>
  chatRepository.saveMessage(
    sessionId,
    userId,
    today,
    message,
    "user",
  );

export const saveAiChatMessage = (
  sessionId: number,
  userId: number,
  today: string,
  message: string,
): Promise<void> =>
  chatRepository.saveMessage(
    sessionId,
    userId,
    today,
    message,
    "psychologist",
  );

