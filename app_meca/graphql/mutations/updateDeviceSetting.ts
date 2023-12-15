import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const UPDATE_DEVICE_SETTING = gql`
  mutation updateDeviceSetting(
    $id: Int!
    $name: String!
    $humidity: Float!
    $incubationDuration: Float!
    $temperature: Float!
  ) {
    updateIncubatorSetting(
      id: $id
      humidity: $humidity
      incubationDuration: $incubationDuration
      name: $name
      temperature: $temperature
    ) {
      incubatorSetting {
        humidity
        id
        incubationDuration
        name
        temperature
      }
    }
  }
`;

export const updateDeviceSetting = async (
  id: number,
  name: string,
  humidity: number,
  incubationDuration: number,
  temperature: number
) => {
  try {
    const response = await client.mutate({
      mutation: UPDATE_DEVICE_SETTING,
      variables: {
        id,
        name,
        humidity,
        incubationDuration,
        temperature,
      },
    });
    return response.data.updateIncubatorSetting;
  } catch (error: any) {
    console.log(error.toString());
  }
};
