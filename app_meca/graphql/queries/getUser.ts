import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const FETCH_USER = gql`
  query FetchUser($id: Int!) {
    user(id: $id) {
      base64Image
      dateJoined
      email
      firstName
      id
      isStaff
      lastName
      username
    }
  }
`;

export const getUser = async (id: number) => {
  try {
    const response = await client.mutate({
      mutation: FETCH_USER,
      variables: { id },
    });
    return response.data.user;
  } catch (error) {}
};
