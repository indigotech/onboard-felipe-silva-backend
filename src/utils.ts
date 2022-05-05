import { randomBytes, scrypt } from 'crypto';

export const handlePasswordValidation = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/; //REGEX: At least 6 characters, one letter and one digit

  return regex.test(password);
};

export const generateHash = async (password: string): Promise<{ salt: string; hashedPassword: string }> => {
  return new Promise<{ salt: string; hashedPassword: string }>((resolve, reject) => {
    const salt = randomBytes(16).toString('hex');

    scrypt(password, salt, 64, (error, generatedHash) => {
      if (error) {
        reject(error);
      }

      resolve({ salt, hashedPassword: generatedHash.toString('hex') });
    });
  });
};
