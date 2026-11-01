import * as userRepository from "./user.repository.js";
import { hashPassword } from "../../shared/utils.js";

export const getUserById = async (userId: number) => {
  return userRepository.findById(userId);
};

export const updateUserById = async (
  userId: number,
  name?: string,
  email?: string,
) => {
  await userRepository.update(userId, name, email);

  return userRepository.findById(userId);
};

export const getUserPasswordHash = async (userId: number) => {
  return userRepository.findPasswordHash(userId);
};

export const updateUserPassword = async (
  userId: number,
  newPassword: string,
): Promise<void> => {
  const hashed = await hashPassword(newPassword);

  await userRepository.updatePasswordHash(userId, hashed);
};