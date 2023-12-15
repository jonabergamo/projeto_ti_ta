import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const UPDATE_ON = gql`
  mutation updateOn(
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
        lastCompletionData
        currentSetting {
          id
        }
      }
    }
  }
`;

export const updateOn = async (uniqueId: string, isOn?: boolean) => {
  try {
    const response = await client.mutate({
      mutation: UPDATE_ON,
      variables: {
        uniqueId: uniqueId,
        isOn: isOn,
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
