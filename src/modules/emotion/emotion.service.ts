import type { ResultSetHeader } from "mysql2";
import * as emotionRepository from "./emotion.repository.js";
import type {
  EmotionData,
  EmotionHistoryItem,
  EmotionRow,
  EmotionChartRow,
} from "./types.js";

export const getTodayEmotionByUserId = async (userId: number): Promise<EmotionRow | null> => {
  return emotionRepository.findTodayByUserId(userId);
};

export const createEmotionForUser = async (
  userId: number,
  data: EmotionData,
): Promise<ResultSetHeader | null> => {
  // Не создаём запись, если все эмоции равны нулю.
  const hasNonZeroValue = Object.values(data).some((value) => value !== 0);

  if (!hasNonZeroValue) {
    return null;
  }

  return emotionRepository.createForUser(userId, data);
};

export const updateEmotionByUserId = async (
  userId: number,
  data: EmotionData,
): Promise<ResultSetHeader> => {
  return emotionRepository.updateTodayByUserId(userId, data);
};

export const getEmotionHistoryByUserId = async (
  userId: number,
  year: string,
  month: string,
): Promise<EmotionHistoryItem[]> => {
  return emotionRepository.findMonthHistoryByUserId(userId, year, month);
};

export const getEmotionChartData = (
  userId: number,
  limit: number,
): Promise<EmotionChartRow[]> => {
  return emotionRepository.findChartDataByUserId(userId, limit);
};
