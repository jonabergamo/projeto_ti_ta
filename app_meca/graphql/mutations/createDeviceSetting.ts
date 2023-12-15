import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const CREATE_DEVICE_SETTING = gql`
  mutation createDeviceSetting(
    $humidity: Float!
    $name: String!
    $temperature: Float!
    $userId: Int!
    $incubationDuration: Float!
  ) {
    createIncubatorSetting(
      humidity: $humidity
      incubationDuration: $incubationDuration
      name: $name
      temperature: $temperature
      userId: $userId
    ) {
      incubatorSetting {
        name
        temperature
        incubationDuration
        id
        humidity
      }
    }
  }
`;

export const createDeviceSetting = async (
  userId: number,
  temperature: number,
  incubationDuration: number,
  humidity: number,
  name: string
) => {
  try {
    const response = await client.mutate({
      mutation: CREATE_DEVICE_SETTING,
      variables: {
        userId,
        temperature,
        incubationDuration,
        humidity,
        name,
      },
    });
    return response;
  } catch (error: any) {
    console.log(error.toString());
  }
};
