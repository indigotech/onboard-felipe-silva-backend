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
}

const createUserQuery = `
mutation CreateUser($credentials: UserInput!) {
  createUser(data: $credentials) {
    id,
    name,
    email,
    birthDate
  }
}
`;

export const createUserMutation = async (url: string, credentials: UserInput) => {
  return axios({
    url,
    method: 'post',
    data: {
      query: createUserQuery,
      variables: { credentials },
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
