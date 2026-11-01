import * as diaryRepository from "./diary.repository.js";
import type { DiaryEntry } from "./types.js";

export const getDiaryEntriesByDate = (
  userId: number,
  date: string,
): Promise<DiaryEntry[]> => {
  return diaryRepository.findByDate(userId, date);
};

export const getDiaryEntryById = (
  userId: number,
  entryId: number,
): Promise<DiaryEntry | null> => {
  return diaryRepository.findById(userId, entryId);
};

export const createDiaryEntry = (
  userId: number,
  date: string,
  text: string,
): Promise<DiaryEntry> => {
  return diaryRepository.create(userId, date, text);
};

export const updateDiaryEntry = (
  userId: number,
  entryId: number,
  text: string,
): Promise<DiaryEntry | null> => {
  return diaryRepository.update(userId, entryId, text);
};

export const deleteDiaryEntry = (
  userId: number,
  entryId: number,
): Promise<boolean> => {
  return diaryRepository.remove(userId, entryId);
};