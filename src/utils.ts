import { randomBytes, scrypt, scryptSync } from 'crypto';

export const isPasswordValid = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; //REGEX: At least 6 characters, one letter and one digit

  return regex.test(password);
};

export const generateHash = (password: string): { salt: string; hashedPassword: string } => {
  const salt = randomBytes(16).toString('hex');

  const hashedPassword = scryptSync(password, salt, 64).toString('hex');

  return { salt, hashedPassword };
};

export const generateHashPasswordFromSalt = (salt: string, password: string) => {
  return scryptSync(password, salt, 64).toString('hex');
};
