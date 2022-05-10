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

<<<<<<< HEAD
export const errorsMessages: Record<string, string> = {
  weakPassword: 'Weak password. It needs at least 6 characters, one letter and one digit!',
  existingEmail: 'This e-mail is already in use.',
};

export const isInputError = (error: any): error is InputError => {
  return error.code === 400;
=======
export const errorsMessages: { existingEmail: string; weakPassword: string } = {
  existingEmail: 'Weak password. It needs at least 6 characters, one letter and one digit!',
  weakPassword: 'This e-mail is already in use.',
>>>>>>> d416809 (deu ruim)
};
