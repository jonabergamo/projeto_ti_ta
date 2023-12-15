import { ApolloError, gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const CREATE_DEVICE = gql`
  mutation createDevice($currentSetting: Int, $name: String!, $userId: Int!) {
    createIncubatorDevice(
      name: $name
      userId: $userId
      currentSetting: $currentSetting
    ) {
      incubatorDevice {
        humiditySensor
        isOn
        name
        startTime
        temperatureSensor
        uniqueId
        currentSetting {
          name
          incubationDuration
          id
          humidity
          temperature
        }
      }
    }
  }
`;

export const createDevice = async (
  userId: number,
  name: string,
  currentSetting?: number | null
) => {
  try {
    // Criando um objeto com as variáveis necessárias
    const variables: { userId: number; name: string; currentSetting?: number } =
      {
        userId,
        name,
      };

    // Se currentSetting não é uma string vazia, adicione-a ao objeto de variáveis
    if (currentSetting) {
      variables.currentSetting = currentSetting;
    }

    const response = await client.mutate({
      mutation: CREATE_DEVICE,
      variables: variables,
    });

    return response.data.createIncubatorDevice;
  } catch (error: any) {
    console.log(error.toString());
  }
};
