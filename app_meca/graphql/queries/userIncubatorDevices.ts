import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const USER_INCUBATOR_DEVICES = gql`
  query getUserIncubatorDevices($userId: Int!) {
    userIncubatorDevices(userId: $userId) {
      humiditySensor
      isOn
      name
      startTime
      temperatureSensor
      uniqueId
      currentSetting {
        name
        temperature
        humidity
        incubationDuration
        id
      }
    }
  }
`;

export const getUserIncubatorDevices = async (userId: number) => {
  try {
    const response = await client.mutate({
      mutation: USER_INCUBATOR_DEVICES,
      variables: { userId },
    });
    return response.data.userIncubatorDevices;
  } catch (error: any) {
    console.log(error.toString());
  }
};
