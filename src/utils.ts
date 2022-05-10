import { randomBytes, scrypt, scryptSync } from 'crypto';

export const isPasswordValid = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; //REGEX: At least 6 characters, one letter and one digit

  return regex.test(password);
};

export const isEmailValid = (email: string) => {
  const regex =
    /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

  return regex.test(email);
};

export const generateHash = (password: string): { salt: string; hashedPassword: string } => {
  const salt = randomBytes(16).toString('hex');

  const hashedPassword = scryptSync(password, salt, 64).toString('hex');

  return { salt, hashedPassword };
};

export const generateHashPasswordFromSalt = (salt: string, password: string) => {
  return scryptSync(password, salt, 64).toString('hex');
};

export const matchString = (a: string, b: string): boolean => {
  return a.toUpperCase() === b.toUpperCase();
};
