import React, { useCallback, useEffect, useState } from "react";
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
import { getIncubatorSetting } from "../graphql/queries/incubatorSetting";
import { updateDeviceSetting } from "../graphql/mutations/updateDeviceSetting";
import { deleteDeviceSetting } from "../graphql/mutations/deleteDeviceSetting";
import ShureDeleteModal from "../components/ShureDeleteModal";

type IncubatorSettingType = {
  __typename: string;
  assignedDevices: { uniqueId: string; name: string }[]; // Substitua 'any' pelo tipo apropriado se os dispositivos atribuídos tiverem uma estrutura conhecida
  humidity: number;
  id: string;
  incubationDuration: number;
  name: string;
  temperature: number;
};
export default function EditSettingForm() {
  const { device_setting } = useGlobalSearchParams();
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);

  const sessionInfo = useSession();

  if (!sessionInfo || !sessionInfo.session) {
    return <Text>Session info not available</Text>;
  }
  const { session } = sessionInfo;
  const [data, setData] = useState<IncubatorSettingType>();

  const fetchIncubatorsSetting = async () => {
    try {
      const response = await getIncubatorSetting(
        parseInt(device_setting as string)
      );
      setData(response);
    } catch (error) {}
  };

  useEffect(() => {
    fetchIncubatorsSetting();
  }, []);

  const [humidity, setHumidity] = useState({ value: "", error: "" });
  const [incubationDuration, setIncubationDuration] = useState({
    value: "",
    error: "",
  });
  const [name, setName] = useState({ value: "", error: "" });
  const [temperature, setTemperature] = useState({ value: "", error: "" });

  useEffect(() => {
    if (data) {
      setName({ value: data.name, error: "" });
      setHumidity({ value: data.humidity.toString(), error: "" });
      setIncubationDuration({
        value: data.incubationDuration.toString(),
        error: "",
      });
      setTemperature({ value: data.temperature.toString(), error: "" });
    }
  }, [data]);

  const onEditPressed = async () => {
    const nameError = name.value ? null : "A configuração precisa de um nome";
    const humidityError = humidity.value ? null : "A humidade é necessária";
    const temperatureError = temperature.value
      ? null
      : "A temperatura é necessária";
    const incubationDurationError = incubationDuration.value
      ? null
      : "O tempo de incubação é necessário";

    if (
      nameError ||
      humidityError ||
      temperatureError ||
      incubationDurationError
    ) {
      setName({ ...name, error: nameError || "" });
      setHumidity({ ...humidity, error: humidityError || "" });
      setTemperature({ ...temperature, error: temperatureError || "" });
      setIncubationDuration({
        ...incubationDuration,
        error: incubationDurationError || "",
      });
    }
    try {
      const response = await updateDeviceSetting(
        parseInt(device_setting as string),
        name.value,
        parseFloat(humidity.value),
        parseFloat(incubationDuration.value),
        parseFloat(temperature.value)
      );
      if (response) {
        Toast.show("Configuração editada com sucesso", toastSettings);

        // Limpar campos
        setName({ value: "", error: "" });
        setHumidity({ value: "", error: "" });
        setTemperature({ value: "", error: "" });
        setIncubationDuration({ value: "", error: "" });

        // Redirecionar para a página desejada
        router.push("/devices_settings?refresh=true");
      }
    } catch (err: any) {
      ToastAndroid.show(
        `Um erro ocorreu ${err.toString()}`,
        ToastAndroid.SHORT
      );
    }
  };

  const onDeletePressed = async () => {
    try {
      const response = await deleteDeviceSetting(
        parseInt(device_setting as string)
      );
      if (response.success) {
        Toast.show("Configuração apagada com sucesso", toastSettings);

        // Redirecionar para a página desejada
        router.push("/devices_settings?refresh=true");
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
      <ShureDeleteModal
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
      <TextInput
        description=""
        label="Humidade (kg/m³)"
        returnKeyType="next"
        labelStyle={{ color: theme.colors.primary }}
        value={humidity.value}
        onChangeText={(text: string) => setHumidity({ value: text, error: "" })}
        error={!!humidity.error}
        errorText={humidity.error}
        autoCapitalize="none"
        autoCompleteType="name"
        textContentType="name"
        keyboardType="decimal-pad"
      />
      <TextInput
        description=""
        label="Temperatura (Graus Celcius)"
        returnKeyType="next"
        labelStyle={{ color: theme.colors.primary }}
        value={temperature.value}
        onChangeText={(text: string) =>
          setTemperature({ value: text, error: "" })
        }
        error={!!temperature.error}
        errorText={temperature.error}
        autoCapitalize="none"
        autoCompleteType="name"
        textContentType="name"
        keyboardType="decimal-pad"
      />
      <TextInput
        description=""
        label="Tempo de incubação (horas)"
        returnKeyType="next"
        labelStyle={{ color: theme.colors.primary }}
        value={incubationDuration.value}
        onChangeText={(text: string) =>
          setIncubationDuration({ value: text, error: "" })
        }
        error={!!incubationDuration.error}
        errorText={incubationDuration.error}
        autoCapitalize="none"
        autoCompleteType="name"
        textContentType="name"
        keyboardType="decimal-pad"
      />
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
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 8,
  },
});
