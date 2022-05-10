export class InputError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(code: number, message: string, additionalInfo?: string) {
    super();

    this.message = message;
    this.code = code;
    this.additionalInfo = additionalInfo ?? null;
  }
}

export const errorsMessages: Record<string, string> = {
  weakPassword: 'Weak password. It needs at least 6 characters, one letter and one digit!',
  existingEmail: 'This e-mail is already in use.',
  invalidPassword: 'Invalid password',
  invalidEmail: 'Invalid email',
  wrongPassword: 'Wrong password',
  wrongEmail: 'Email not registered',
};

export const isInputError = (error: any): error is InputError => {
  return error.code === 400;
};
