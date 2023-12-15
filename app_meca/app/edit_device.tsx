import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
} from "react-native";
import { theme } from "../core/theme";
import { router, useGlobalSearchParams } from "expo-router";
import Toast from "react-native-root-toast";
import { useSession } from "../context/AuthContext";
import { createDeviceSetting } from "../graphql/mutations/createDeviceSetting";
import { toastSettings } from "../components/ToastSettings";
import TextInput from "../components/TextInput";
import { createDevice } from "../graphql/mutations/createDevice";
import { getUserIncubatorSettings } from "../graphql/queries/userIncubatorSettings";
import { Picker } from "@react-native-picker/picker"; // Importe Picker de @react-native-picker/picker
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { getIncubatorDevice } from "../graphql/queries/getIncubatorDevice";
import { updateDevice } from "../graphql/mutations/updateDevice";
import { deleteIncubatorDevice } from "../graphql/mutations/deleteDevice";
import ShureDelete from "../components/ShureDeleteModal";

type IncubatorSettingType = {
  __typename: string;
  assignedDevices: { uniqueId: string; name: string }[]; // Substitua 'any' pelo tipo apropriado se os dispositivos atribuídos tiverem uma estrutura conhecida
  humidity: number;
  id: string;
  incubationDuration: number;
  name: string;
  temperature: number;
};

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

export default function EditDeviceForm() {
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const { device_id } = useGlobalSearchParams();

  const sessionInfo = useSession();

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }
  const { session, isLoading } = sessionInfo;
  const [data, setData] = useState<IncubatorSettingType>();
  const [device, setDevice] = useState<IncubatorDeviceType>();

  const fetchIncubatorDevice = async () => {
    try {
      const response = await getIncubatorDevice(device_id as string);
      setDevice(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorDevice();
  }, [device_id]);

  const [name, setName] = useState({ value: "", error: "" });

  const [incubatorsSettings, setIncubatorsSettings] = useState<
    IncubatorSettingType[]
  >([]);
  const [selectedSettingId, setSelectedSettingId] = useState({
    value: "",
    error: "",
  });

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  useEffect(() => {
    if (device) {
      setName({ value: device.name, error: "" });
      setSelectedSettingId({
        value: device?.currentSetting?.id.toString(),
        error: "",
      });
    }
  }, [device]);

  const fetchIncubatorsSettings = async () => {
    try {
      const response = await getUserIncubatorSettings(
        parseInt(session.user.id)
      );
      setIncubatorsSettings(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorsSettings();
  }, [session]);

  const onEditPressed = async () => {
    if (!device?.uniqueId) return;
    const nameError = name.value ? null : "O dispositivo precisa de um nome";
    const selectedSettingIdError = selectedSettingId.value
      ? null
      : "Você precisa escolher uma configuração";

    if (nameError || selectedSettingIdError) {
      setName({ ...name, error: nameError || "" });
      setSelectedSettingId({
        ...selectedSettingId,
        error: selectedSettingIdError || "",
      });
    } else {
      try {
        console.log(
          device?.uniqueId,
          name.value,
          parseInt(selectedSettingId.value)
        );
        const response = await updateDevice(
          device?.uniqueId,
          name.value,
          parseInt(selectedSettingId.value) // Usar 'selectedSettingId' diretamente
        );
        if (response) {
          Toast.show("Dispositivo editado com sucesso", toastSettings);

          // Limpar campos
          setName({ value: "", error: "" });
          setSelectedSettingId({ value: "", error: "" }); // Apenas definir como string vazia

          // Redirecionar para a página desejada
          router.push("/devices?refresh=true");
        }
      } catch (err: any) {
        ToastAndroid.show(
          `Um erro ocorreu ${err.toString()}`,
          ToastAndroid.SHORT
        );
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncubatorsSettings().then(() => setRefreshing(false));
  }, []);
  const scrollViewRef = useRef<any>();

  const onDeletePressed = async () => {
    try {
      const response = await deleteIncubatorDevice(device_id as string);
      if (response.success) {
        Toast.show("Dispositivo apagado com sucesso", toastSettings);

        // Redirecionar para a página desejada
        router.push("/devices?refresh=true");
      }
    } catch (err: any) {
      ToastAndroid.show(
        `Um erro ocorreu ao deletar${err.toString()}`,
        ToastAndroid.SHORT
      );
    }
  };

  return (
    <View style={styles.container}>
      <ShureDelete
        visible={isDeleteVisible}
        onCancel={() => {
          setIsDeleteVisible(false);
        }}
        onConfirm={() => {
          onDeletePressed();
        }}
      />
      <Image
        source={require("../assets/device_settings.png")}
        style={styles.image}
      />
      <TextInput
        description=""
        label="Nome"
        returnKeyType="next"
        labelStyle={{ color: theme.colors.primary }}
        value={name.value}
        onChangeText={(text: string) => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error}
        autoCapitalize="none"
        autoCompleteType="name"
        textContentType="name"
        keyboardType="default"
      />
      <Text style={styles.topText}>Selecione a configuração desejada:</Text>
      {selectedSettingId.error && (
        <Text style={styles.error}>{selectedSettingId.error}</Text>
      )}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {incubatorsSettings ? (
          incubatorsSettings.map((setting, index) => (
            <TouchableOpacity
              key={index}
              style={{
                ...styles.settingItem,
                backgroundColor:
                  setting.id === selectedSettingId.value
                    ? theme.colors.primary
                    : "#161616",
              }}
              onPress={() => {
                setSelectedSettingId({
                  ...selectedSettingId,
                  value: setting.id,
                });
              }}>
              <Text style={styles.deviceName}>ID: {setting.id}</Text>
              <Text style={styles.deviceName}>Nome: {setting.name}</Text>
              <Text style={styles.deviceText}>
                Temperatura: {setting.temperature}°C
              </Text>
              <Text style={styles.deviceText}>
                Humidade: {setting.humidity}
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
          <View>
            <Text style={styles.settingText}>
              Nenhuma configuração encontrada, crie uma aqui
            </Text>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => {
                router.push("/new_device_setting");
              }}>
              <Text
                style={styles.sendButtonText}
                onPress={() => {
                  router.push("/new_device_setting");
                }}>
                CRIAR CONFIGURAÇÃO
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity style={styles.sendButton} onPress={onEditPressed}>
          <Text style={styles.sendButtonText} onPress={onEditPressed}>
            SALVAR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setIsDeleteVisible(true);
          }}>
          <Text
            style={styles.sendButtonText}
            onPress={() => {
              setIsDeleteVisible(true);
            }}>
            DELETAR
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
    justifyContent: "flex-start",
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
  deleteButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deviceName: {
    fontSize: 18, // Tamanho da fonte para o nome
    fontWeight: "bold", // Negrito para o nome
    marginBottom: 10, // Espaçamento inferior maior para o nome
    color: "white",
  },
  topText: {
    color: "white",
    fontSize: 20,
    paddingVertical: 10,
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
  },
  settingValueText: {
    padding: 2,
    backgroundColor: theme.colors.primary,
  },
  error: { color: "red" },
  settingText: {
    display: "flex",
    color: "white",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "80%",
    backgroundColor: "white",
  },
  sendButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
});
