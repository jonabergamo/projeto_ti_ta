import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const AUTH_TOKEN = gql`
  mutation AuthToken($email: String!, $password: String!) {
    tokenAuth(email: $email, password: $password) {
      token
      user {
        email
        firstName
        id
        isStaff
        lastName
        username
        base64Image
        dateJoined
      }
    }
  }
`;

export const authenticateUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await client.mutate({
      mutation: AUTH_TOKEN,
      variables: { email, password },
    });
    console.log(response);
    return response.data.tokenAuth;
  } catch (error) {
    console.error(error)
  }
};
