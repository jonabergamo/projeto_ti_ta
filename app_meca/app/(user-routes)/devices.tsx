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
import { useSession } from "../../context/AuthContext";
import { ScrollView } from "react-native-gesture-handler";
import { getUserIncubatorDevices } from "../../graphql/queries/userIncubatorDevices";
import { toastSettings } from "../../components/ToastSettings";
import Toast from "react-native-root-toast";
import * as Clipboard from "expo-clipboard";
import { Code } from "../../ccode";
import IncubationTimer from "../../components/incubationTimer";
import { Ionicons } from "@expo/vector-icons";

type IncubatorDeviceType = {
  __typename: string;
  humiditySensor: number;
  isOn: boolean;
  name: string;
  startTime: any;
  temperatureSensor: number;
  uniqueId: string;
  currentSetting: {
    name: String;
    temperature: number;
    humidity: number;
    incubationDuration: number;
    id: number;
  };
};

export default function DeviceScreen() {
  const { refresh } = useGlobalSearchParams();

  const sessionInfo = useSession();
  const [refreshing, setRefreshing] = useState(false);

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }
  const { session } = sessionInfo;
  const [data, setData] = useState<IncubatorDeviceType[]>([]);

  const fetchIncubatorsDevice = async () => {
    try {
      const response = await getUserIncubatorDevices(parseInt(session.user.id));
      setData(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorsDevice();
  }, [refresh]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncubatorsDevice().then(() => setRefreshing(false));
  }, []);

  const scrollViewRef = useRef<any>();

  const copyToClipboard = async (id: string) => {
    await Clipboard.setStringAsync(id);
    Toast.show("ID Copiado", toastSettings);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dispositivos</Text>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {data &&
          data.map((device, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() => {
                router.push(`/edit_device?device_id=${device.uniqueId}`);
              }}>
              <Text style={styles.deviceName}>Nome: {device.name}</Text>
              {device.currentSetting ? (
                <View style={{ backgroundColor: "transparent" }}>
                  <Text
                    style={[
                      styles.deviceName,
                      { color: device?.isOn ? "green" : "red" },
                    ]}>
                    {device?.isOn ? "Ligado" : "Desligado"}
                  </Text>
                  <Text style={styles.deviceText}>
                    Sensor de Humidade: {device.humiditySensor}% /{" "}
                    {device?.currentSetting?.humidity}%
                  </Text>
                  <Text style={styles.deviceText}>
                    Sensor de Temperatura: {device.temperatureSensor}°C /{" "}
                    {device?.currentSetting?.temperature}°C
                  </Text>
                  <Text style={styles.deviceText}>
                    Inicio da incubação:{" "}
                    {device?.startTime !== null
                      ? new Date(device.startTime).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })
                      : "Não iniciado"}
                  </Text>
                  <Text style={styles.deviceText}>
                    Tempo restante de incubação:{" "}
                    <IncubationTimer
                      device={device}
                      incubationDuration={
                        device?.currentSetting?.incubationDuration
                      }
                    />
                  </Text>
                  <Text style={styles.deviceText}>
                    Configuração atual: {device?.currentSetting?.name}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: "red",
                    padding: 8,
                    borderRadius: 5,
                  }}>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      backgroundColor: "transparent",
                      alignItems: "center",
                      gap: 5,
                    }}>
                    <Ionicons name="alert-circle" size={24} color="white" />
                    <Text style={{ fontSize: 20 }}>
                      Dispositivo sem configuração!
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15 }}>
                    Clique e selecione uma configuração para visualizar as
                    métricas.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => copyToClipboard(device.uniqueId)}>
                <Text style={styles.deviceName}>ID do dispositivo:</Text>
                <Text style={styles.deviceText}>{device.uniqueId}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  copyToClipboard(
                    Code(session.token, device.uniqueId, "teste", "senha@123")
                  );
                  Toast.show(
                    "Código base copiado com sucesso, envie para seu microcontrolador"
                  ),
                    toastSettings;
                }}>
                <Text
                  style={styles.signOutText}
                  onPress={() => {
                    copyToClipboard(
                      Code(session.token, device.uniqueId, "teste", "senha@123")
                    );
                    Toast.show(
                      "Código copiado com sucesso, envie para seu microcontrolador"
                    ),
                      toastSettings;
                  }}>
                  COPIAR CÓDIGO EM C
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            router.push("/new_device");
          }}>
          <Text
            style={styles.signOutText}
            onPress={() => {
              router.push("/new_device");
            }}>
            NOVO DISPOSITIVO
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
