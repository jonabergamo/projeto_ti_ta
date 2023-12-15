import { StyleSheet, TouchableOpacity } from "react-native";

import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useEffect, useState } from "react";
import { getUserIncubatorDevices } from "../../graphql/queries/userIncubatorDevices";
import { useSession } from "../../context/AuthContext";
import { router, useGlobalSearchParams } from "expo-router";
import { theme } from "../../core/theme";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import DevicesModal from "../../components/DevicesModal";
import { getIncubatorDevice } from "../../graphql/queries/getIncubatorDevice";
import IncubationTimer from "../../components/incubationTimer";
import MyVictoryChart from "../../components/CustomLineChart";
import { updateDevice } from "../../graphql/mutations/updateDevice";
import SensorChart from "../../components/CustomLineChart";
import { updateOn } from "../../graphql/mutations/updateOn";
import ShureDeleteModal from "../../components/ShureDeleteModal";
import { Audio } from "expo-av";

type IncubatorDeviceType = {
  __typename: string;
  humiditySensor: number;
  isOn: boolean;
  name: string;
  startTime: any;
  temperatureSensor: number;
  uniqueId: string;
  lastCompletionData: Date;
  currentSetting: {
    name: String;
    temperature: number;
    humidity: number;
    incubationDuration: number;
    id: number;
  };
};

const soundObject = new Audio.Sound();

export default function DashbaordScreen() {
  const [selectedDevice, setSelectedDevice] = useState<IncubatorDeviceType>();
  const [incubatorsDevice, setIncubatorsDevice] = useState<
    IncubatorDeviceType[]
  >([]);
  const { refresh } = useGlobalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const sessionInfo = useSession();
  const [refreshing, setRefreshing] = useState(false);

  const loadSound = async () => {
    await soundObject.loadAsync(require("../../assets/chick-sound.mp3"));
  };

  useEffect(() => {
    loadSound();
  }, []);

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }
  const { session } = sessionInfo;

  const fetchIncubatorsDevice = async () => {
    try {
      const response = await getUserIncubatorDevices(parseInt(session.user.id));
      setIncubatorsDevice(response);

      if (!selectedDevice) {
        setSelectedDevice(response[0]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDevice();
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedDevice]);

  const fetchDevice = async () => {
    if (!selectedDevice) return;
    try {
      const response: IncubatorDeviceType = await getIncubatorDevice(
        selectedDevice?.uniqueId
      );
      if (selectedDevice.isOn && !response.isOn) {
        console.log("ativou");
        await soundObject.playAsync();
        await soundObject.stopAsync();
      }
      setSelectedDevice(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorsDevice();
  }, [refresh]);

  const onToggleOnPressed = async (newOn: boolean) => {
    if (!selectedDevice) return;
    try {
      const response = await updateOn(selectedDevice?.uniqueId, newOn);
      console.log(selectedDevice?.uniqueId, newOn);
      setIsDeleteVisible(false);
    } catch (error) {}
  };

  return (
    incubatorsDevice && (
      <View style={styles.container}>
        <ShureDeleteModal
          visible={isDeleteVisible}
          onCancel={() => {
            setIsDeleteVisible(false);
          }}
          onConfirm={() => {
            if (selectedDevice) onToggleOnPressed(!selectedDevice.isOn);
          }}
          text={"Tem certeza que deseja desligar?"}
        />
        <DevicesModal
          visible={showModal}
          devices={incubatorsDevice}
          onSelect={(device) => {
            setSelectedDevice(device);
            setShowModal(false);
          }}
        />
        <View
          style={{
            display: "flex",
            gap: 2,
            width: "100%",
          }}>
          <Text>Dispositivo selecionado: </Text>
          <TouchableOpacity
            style={{
              padding: 15,
              borderColor: theme.colors.primary,
              borderWidth: 1,
              justifyContent: "space-between",
              borderRadius: 5,
              width: "100%",
              flexDirection: "row",
            }}
            onPress={() => {
              if (incubatorsDevice.length > 0) {
                setShowModal(true);
              }
            }}>
            <Text style={{ fontSize: 15 }}>
              {selectedDevice?.name || "Nenhum"}
            </Text>
            <FontAwesome name="exchange" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {selectedDevice ? (
          <View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                router.push(
                  `/edit_device?device_id=${selectedDevice?.uniqueId}`
                );
              }}>
              <Text style={styles.deviceName}>
                Nome: {selectedDevice?.name}
              </Text>
              {selectedDevice?.currentSetting ? (
                <View style={{ backgroundColor: "transparent" }}>
                  <Text
                    style={[
                      styles.deviceName,
                      { color: selectedDevice?.isOn ? "green" : "red" },
                    ]}>
                    {selectedDevice?.isOn ? "Ligado" : "Desligado"}
                  </Text>
                  <Text style={styles.deviceText}>
                    Sensor de Humidade: {selectedDevice?.humiditySensor}% /{" "}
                    {selectedDevice?.currentSetting?.humidity}%
                  </Text>
                  <Text style={styles.deviceText}>
                    Sensor de Temperatura: {selectedDevice?.temperatureSensor}°C
                    / {selectedDevice?.currentSetting?.temperature}°C
                  </Text>
                  <Text style={styles.deviceText}>
                    Inicio da incubação:{" "}
                    {selectedDevice?.startTime !== null
                      ? new Date(selectedDevice?.startTime).toLocaleString(
                          "pt-BR",
                          {
                            timeZone: "America/Sao_Paulo",
                          }
                        )
                      : "Não iniciado"}
                  </Text>
                  <Text style={styles.deviceText}>
                    Tempo restante de incubação:{" "}
                    {selectedDevice.startTime && (
                      <IncubationTimer
                        device={selectedDevice}
                        incubationDuration={
                          selectedDevice?.currentSetting?.incubationDuration
                        }
                      />
                    )}
                  </Text>
                  <Text style={styles.deviceText}>
                    Término da ultima incubação:{" "}
                    {selectedDevice.lastCompletionData ? (
                      <Text>
                        {new Date(
                          selectedDevice.lastCompletionData
                        ).toLocaleString()}
                      </Text>
                    ) : (
                      <Text>Nunca finalizado</Text>
                    )}
                  </Text>
                  <Text style={styles.deviceText}>
                    Configuração atual: {selectedDevice?.currentSetting?.name}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.signOutButton,
                      {
                        backgroundColor: selectedDevice.isOn ? "red" : "green",
                      },
                    ]}
                    onPress={() => {
                      if (selectedDevice.isOn) {
                        setIsDeleteVisible(true);
                      } else {
                        onToggleOnPressed(!selectedDevice.isOn);
                      }
                    }}>
                    <Text
                      style={styles.signOutText}
                      onPress={() => {
                        if (selectedDevice.isOn) {
                          setIsDeleteVisible(true);
                        } else {
                          onToggleOnPressed(!selectedDevice.isOn);
                        }
                      }}>
                      {selectedDevice.isOn ? "DESLIGAR" : "LIGAR"}
                    </Text>
                  </TouchableOpacity>
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
            </TouchableOpacity>
            {selectedDevice.currentSetting && (
              <SensorChart
                idealTemperature={selectedDevice?.currentSetting?.temperature}
                idealHumidity={selectedDevice?.currentSetting?.humidity}
                temperatureSensor={selectedDevice?.temperatureSensor}
                humiditySensor={selectedDevice?.humiditySensor}
              />
            )}
          </View>
        ) : (
          <Text>Você não possui nenhum dispositivo</Text>
        )}
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  settingItem: {
    backgroundColor: "#2A2E35", // Cor de fundo para cada item (ajuste conforme seu tema)
    padding: 15, // Espaçamento interno
    borderRadius: 10, // Bordas arredondadas
    marginVertical: 8, // Espaçamento vertical entre itens
    marginHorizontal: 1, // Espaçamento horizontal
    shadowColor: "#000", // Cor da sombra
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Opacidade da sombra
    shadowRadius: 3.84, // Raio da sombra
    elevation: 5, // Elevação para Android
  },
  signOutButton: {
    marginTop: 20,
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
  deviceDetails: {
    marginTop: 20,
    padding: 10,
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 5,
  },
});
