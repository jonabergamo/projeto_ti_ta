import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const DELETE_DEVICE = gql`
  mutation deleteIncubatorDevice($uniqueId: String!) {
    deleteIncubatorDevice(uniqueId: $uniqueId) {
      success
    }
  }
`;

export const deleteIncubatorDevice = async (uniqueId: string) => {
  try {
    const response = await client.mutate({
      mutation: DELETE_DEVICE,
      variables: {
        uniqueId,
      },
    });
    return response.data.deleteIncubatorDevice;
  } catch (error: any) {
    console.log(error.toString());
  }
};
