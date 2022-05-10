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
  invalidInput: 'Invalid email or password',
};

export const isInputError = (error: any): error is InputError => {
  return error.code === 400 || error.code === 401;
};
