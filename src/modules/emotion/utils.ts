import type { EmotionData } from "./types.js";

export const isValidEmotionData = (
  data: unknown,
): data is EmotionData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const body = data as Record<string, unknown>;

  const keys = [
    "joy",
    "sadness",
    "fear",
    "anger",
    "surprise",
  ];

  return keys.every((key) => {
    const value = body[key];

    return (
      typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 5
    );
  });
};