import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const DELETE_DEVICE_SETTING = gql`
  mutation deleteDeviceSetting($id: Int!) {
    deleteIncubatorSetting(id: $id) {
      success
    }
  }
`;

export const deleteDeviceSetting = async (id: number) => {
  try {
    const response = await client.mutate({
      mutation: DELETE_DEVICE_SETTING,
      variables: {
        id,
      },
    });
    return response.data.deleteIncubatorSetting;
  } catch (error: any) {
    console.log(error.toString());
  }
};
