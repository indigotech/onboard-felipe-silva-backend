import { randomBytes, scrypt, scryptSync } from 'crypto';
import { JsonWebTokenError, JwtPayload, TokenExpiredError, verify } from 'jsonwebtoken';
import { jwtTokenSecret } from './data-source';
import { AuthorizationError, errorsMessages } from './error';

const emailRegex =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; //REGEX: At least 6 characters, one letter and one digit

export const isPasswordValid = (password: string) => {
  return passwordRegex.test(password);
};

export const isEmailValid = (email: string) => {
  return emailRegex.test(email);
};

export const generateHash = (password: string): { salt: string; hashedPassword: string } => {
  const salt = randomBytes(16).toString('hex');

  const hashedPassword = scryptSync(password, salt, 64).toString('hex');

  return { salt, hashedPassword };
};

export const generateHashPasswordFromSalt = (salt: string, password: string) => {
  return scryptSync(password, salt, 64).toString('hex');
};

export const verifyToken = (token: string) => {
  try {
    verify(token, jwtTokenSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AuthorizationError(errorsMessages.expired);
    } else if (err instanceof JsonWebTokenError) {
      throw new AuthorizationError(errorsMessages.unauthorized);
    }
  }
};
