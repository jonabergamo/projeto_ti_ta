import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const USER_INCUBATOR_SETTINGS = gql`
  query GetUserIncubatorSettings($userId: Int!) {
    userIncubatorSettings(userId: $userId) {
      humidity
      id
      incubationDuration
      temperature
      name
      assignedDevices {
        uniqueId
        name
      }
    }
  }
`;

export const getUserIncubatorSettings = async (userId: number) => {
  try {
    const response = await client.mutate({
      mutation: USER_INCUBATOR_SETTINGS,
      variables: { userId },
    });
    return response.data.userIncubatorSettings;
  } catch (error: any) {
    console.log(error.toString());
  }
};
