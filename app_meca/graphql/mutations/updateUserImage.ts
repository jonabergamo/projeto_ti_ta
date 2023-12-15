import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client
import { ImagePickerResult, Session } from "../../types";
import { useSession } from "../../context/AuthContext";

export const UPDATE_USER_IMAGE = gql`
  mutation updateUserImage($id: Int!, $base64Image: String!) {
    updateUser(id: $id, base64Image: $base64Image) {
      user {
        base64Image
        dateJoined
      }
    }
  }
`;

export const updateUserImage = async (
  base64Image: string,
  session: Session
) => {
  try {
    const id = parseInt(session.user.id);
    const response = await client.mutate({
      mutation: UPDATE_USER_IMAGE,
      variables: { id, base64Image },
    });
    return response.data.updateUser.user.base64Image;
  } catch (error) {
    console.log("erro");
    console.error(error);
  }
};
