export class InputError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(message: string, additionalInfo?: string) {
    super();

    this.message = message;
    this.code = 400;
    this.additionalInfo = additionalInfo ?? null;
  }
}

export class AuthorizationError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(message: string, additionalInfo?: string) {
    super();

    this.message = message;
    this.code = 401;
    this.additionalInfo = additionalInfo ?? null;
  }
}

export const errorsMessages: Record<string, string> = {
  weakPassword: 'Weak password. It needs at least 6 characters, one letter and one digit!',
  existingEmail: 'This e-mail is already in use.',
  invalidInput: 'Invalid email or password',
  unauthorized: 'Unauthorized',
  expired: 'Expired Token',
  userDoesntExist: 'This user does not exist',
};

export const isInputError = (error: any): error is InputError => {
  return error.code === 400;
};

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error.code === 401;
};
