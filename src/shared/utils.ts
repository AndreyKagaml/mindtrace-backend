import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;
// auth, user
export const hashPassword = async (
  password: string
) => {
  return await bcrypt.hash(
    password,
    SALT_ROUNDS
  );
};

// auth, user
export const comparePassword = async (
  password: string,
  hash: string
) => {
  return await bcrypt.compare(
    password,
    hash
  );
};

// chat, diary
export const getTodayDate = (): string => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.CHAT_TIME_ZONE || "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
};

// chat, diary
export const isValidDate = (date: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

// chat
export const getErrorStatus = (error: unknown): number => {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return 500;
};

// chat
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : "Internal server error";
};