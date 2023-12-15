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
import { router } from "expo-router";
import Toast from "react-native-root-toast";
import { useSession } from "../context/AuthContext";
import { createDeviceSetting } from "../graphql/mutations/createDeviceSetting";
import { toastSettings } from "../components/ToastSettings";
import TextInput from "../components/TextInput";
import { createDevice } from "../graphql/mutations/createDevice";
import { getUserIncubatorSettings } from "../graphql/queries/userIncubatorSettings";
import { Picker } from "@react-native-picker/picker"; // Importe Picker de @react-native-picker/picker
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

type IncubatorSettingType = {
  __typename: string;
  assignedDevices: { uniqueId: string; name: string }[]; // Substitua 'any' pelo tipo apropriado se os dispositivos atribuídos tiverem uma estrutura conhecida
  humidity: number;
  id: string;
  incubationDuration: number;
  name: string;
  temperature: number;
};

export default function CreationForm() {
  const sessionInfo = useSession();
  const [refreshing, setRefreshing] = useState(false);

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

  const { session, isLoading } = sessionInfo;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

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

  const onCreatePressed = async () => {
    const nameError = name.value ? null : "O dispositivo precisa de um nome";

    if (nameError) {
      setName({ ...name, error: nameError || "" });
    } else {
      try {
        const response = await createDevice(
          parseInt(session.user.id),
          name.value,
          selectedSettingId.value ? parseInt(selectedSettingId.value) : null // Usar 'selectedSettingId' diretamente
        );
        if (response) {
          Toast.show("Configuração criada com sucesso", toastSettings);

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

  return (
    <View style={styles.container}>
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
                    <Text style={{ color: "white" }}>Nenhum</Text>
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

      <TouchableOpacity style={styles.sendButton} onPress={onCreatePressed}>
        <Text style={styles.sendButtonText} onPress={onCreatePressed}>
          CRIAR
        </Text>
      </TouchableOpacity>
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
