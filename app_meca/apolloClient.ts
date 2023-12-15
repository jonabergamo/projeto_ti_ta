import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/link-context";
import { Session } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const httpLink = createHttpLink({
  uri: "https://aguinaldomendes5.pythonanywhere.com/graphql",
});

const authLink = setContext(async (_, { headers }) => {
  // Obter o token de autenticação do armazenamento local
  const savedSession = await AsyncStorage.getItem("userSession"); // Substitua por sua lógica de autenticação
  if (savedSession) {
    const parsedSession = JSON.parse(savedSession) as Session;
    const token = parsedSession.token;
    return {
      headers: {
        ...headers,
        authorization: token ? `JWT ${token}` : "",
      },
    };
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
