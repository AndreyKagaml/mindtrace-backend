import { hashPassword, comparePassword } from "../../shared/utils.js";
import * as authRepository from "./auth.repository.js";

export const registerUser = async (
  email: string,
  password: string,
  name: string,
): Promise<number> => {
  const hashedPassword = await hashPassword(password);

  return authRepository.createUser(email, hashedPassword, name);
};

export const findUserByEmail = async (email: string) => {
  return authRepository.findByEmail(email);
};

export const verifyUser = async (email: string, password: string) => {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    return null;
  }

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    return null;
  }

  return user;
};