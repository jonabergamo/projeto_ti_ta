import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const UPDATE_DEVICE = gql`
  mutation updateDevice(
    $uniqueId: String!
    $name: String
    $currentSettingId: Int
    $isOn: Boolean
  ) {
    updateIncubatorDevice(
      uniqueId: $uniqueId
      currentSettingId: $currentSettingId
      name: $name
      isOn: $isOn
    ) {
      incubatorDevice {
        humiditySensor
        isOn
        name
        startTime
        temperatureSensor
        uniqueId
        currentSetting {
          id
        }
      }
    }
  }
`;

export const updateDevice = async (
  uniqueId: string,
  name?: string,
  currentSettingId?: number,
  isOn?: boolean
) => {
  try {
    const response = await client.mutate({
      mutation: UPDATE_DEVICE,
      variables: {
        uniqueId: uniqueId,
        isOn: isOn,
        currentSettingId,
        name,
      },
    });
    return response.data.updateIncubatorDevice;
  } catch (error: any) {
    if (error instanceof ApolloError) {
      // Tratamento específico para ApolloError
      console.log(error.message);
    } else {
      // Tratamento para outros tipos de erros
      console.log(error.toString());
    }
  }
};
