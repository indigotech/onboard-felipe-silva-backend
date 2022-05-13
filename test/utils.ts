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

export interface UserResponse {
  email: string;
  name: string;
  id: number;
  birthDate: string;
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

export const userQuery = async (url: string, id: number, token: string) => {
  return axios({
    url,
    method: 'post',
    headers: {
      Authorization: token,
    },
    data: {
      query: `
      query Query($userId: Int!) {
        user(id: $userId) {
          id
          name
          email
          birthDate
        }
      }
      `,
      variables: { userId: id },
    },
  });
};

export const userListQuery = async (url: string, token: string, quantity?: number, offset?: number) => {
  return axios({
    url,
    method: 'post',
    headers: {
      Authorization: token,
    },
    data: {
      query: `
      query Users($quantity: Int, $offset: Int) {
        data(quantity: $quantity, offset: $offset) {
          users {
            id
            name
            email
            birthDate
          }
          pagination {
            hasNextPage
            hasPreviousPage
            totalQuantity
            currentPage
            totalPages
          }
        }
      }
      `,
      variables: { quantity, offset },
    },
  });
};
