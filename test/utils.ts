import axios from 'axios';

export interface UserInput {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const createUserQuery = `
mutation CreateUser($credentials: UserInput!) {
  createUser(user: $credentials) {
    id,
    name,
    email,
    birthDate
  }
}
`;

export const createUserMutation = async (url: string, credentials: UserInput, token: string) => {
  return axios({
    url,
    method: 'post',
    headers: {
      Authorization: token,
    },
    data: {
      query: createUserQuery,
      variables: { credentials, token },
    },
  });
};

export const loginMutation = async (url: string, loginCredentials: LoginInput) => {
  return axios({
    url,
    method: 'post',
    data: {
      query: `
        mutation Login($credentials: LoginInput!) {
          login(data: $credentials) {
            user {              
              id,
              name,
              email,
              birthDate
            },
            token
          }
        }
      `,
      variables: { credentials: loginCredentials },
    },
  });
};
