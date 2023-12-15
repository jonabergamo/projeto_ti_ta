import { RefreshControl, StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { theme } from "../../core/theme";
import { router, useGlobalSearchParams } from "expo-router";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { getUserIncubatorSettings } from "../../graphql/queries/userIncubatorSettings";
import { useSession } from "../../context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";

type IncubatorSettingType = {
  __typename: string;
  assignedDevices: { uniqueId: string; name: string }[]; // Substitua 'any' pelo tipo apropriado se os dispositivos atribuídos tiverem uma estrutura conhecida
  humidity: number;
  id: string;
  incubationDuration: number;
  name: string;
  temperature: number;
};

export default function DeviceSettingsScreen() {
  const { refresh } = useGlobalSearchParams();
  const sessionInfo = useSession();
  const [refreshing, setRefreshing] = useState(false);

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }
  const { session } = sessionInfo;
  const [data, setData] = useState<IncubatorSettingType[]>([]);

  const fetchIncubatorsSettings = async () => {
    try {
      const response = await getUserIncubatorSettings(
        parseInt(session.user.id)
      );
      setData(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorsSettings();
  }, [refresh]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncubatorsSettings().then(() => setRefreshing(false));
  }, []);

  const scrollViewRef = useRef<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prédefinições</Text>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {data ? (
          data.map((setting, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => {
                router.push(
                  `/edit_device_setting?device_setting=${setting.id}`
                );
              }}>
              <Text style={styles.deviceText}>ID: {setting.id}</Text>
              <Text style={styles.deviceText}>Nome: {setting.name}</Text>
              <Text style={styles.deviceText}>
                Temperatura: {setting.temperature}°C
              </Text>
              <Text style={styles.deviceText}>
                Humidade: {setting.humidity}%
              </Text>
              <Text style={styles.deviceText}>
                Duração da Incubação: {setting.incubationDuration} horas
              </Text>

              <View style={styles.settingValueTitle}>
                <Text style={styles.deviceText}>Em uso por: </Text>
                <View style={styles.settingValueContainer}>
                  {setting?.assignedDevices?.length !== 0 ? (
                    setting?.assignedDevices.map((device, index) => (
                      <Text style={styles.settingValueText} key={index}>
                        {device.name}
                      </Text>
                    ))
                  ) : (
                    <Text>Nenhum</Text>
                  )}
                </View>
              </View>
              {/* Outras informações que deseja exibir */}
            </TouchableOpacity>
          ))
        ) : (
          <Text>Nenhum dispositivo</Text>
        )}
      </ScrollView>
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            router.push("/new_device_setting");
          }}>
          <Text
            style={styles.signOutText}
            onPress={() => {
              router.push("/new_device_setting");
            }}>
            NOVA PREDEFINIÇÃO
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            onRefresh();
          }}>
          <Text
            style={styles.signOutText}
            onPress={() => {
              onRefresh();
            }}>
            RECARREGAR
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between", // Alterado para space-between
    marginTop: 25,
    paddingVertical: 20, // Espaçamento vertical
  },
  scrollView: {
    width: "100%", // Garante que a ScrollView ocupe toda a largura
    flex: 1,
  },
  settingValueContainer: {
    marginHorizontal: 5,
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    display: "flex",
    width: "70%",
    backgroundColor: "transparent",
  },
  settingValueTitle: {
    color: "white",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "transparent",
  },
  settingValueText: {
    padding: 2,
    backgroundColor: theme.colors.primary,
  },
  settingItem: {
    backgroundColor: "#2A2E35", // Cor de fundo para cada item (ajuste conforme seu tema)
    padding: 15, // Espaçamento interno
    borderRadius: 10, // Bordas arredondadas
    marginVertical: 8, // Espaçamento vertical entre itens
    marginHorizontal: 16, // Espaçamento horizontal
    shadowColor: "#000", // Cor da sombra
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Opacidade da sombra
    shadowRadius: 3.84, // Raio da sombra
    elevation: 5, // Elevação para Android
  },

  deviceText: {
    color: "white", // Cor do texto (ajuste conforme seu tema)
    fontSize: 16, // Tamanho da fonte
    marginBottom: 5, // Espaçamento inferior para cada linha de texto
  },

  deviceName: {
    fontSize: 18, // Tamanho da fonte para o nome
    fontWeight: "bold", // Negrito para o nome
    marginBottom: 10, // Espaçamento inferior maior para o nome
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 15,
  },
  signOutButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});
