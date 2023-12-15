import { gql } from "@apollo/client";
import client from "../../apolloClient"; // Seu Apollo Client

export const INCUBATOR_SETTING = gql`
  query getIncubatorSetting($id: Int!) {
    incubatorSetting(id: $id) {
      humidity
      id
      incubationDuration
      name
      temperature
    }
  }
`;

export const getIncubatorSetting = async (id: number) => {
  try {
    const response = await client.mutate({
      mutation: INCUBATOR_SETTING,
      variables: { id },
    });
    return response.data.incubatorSetting;
  } catch (error: any) {
    console.log(error.toString());
  }
};
