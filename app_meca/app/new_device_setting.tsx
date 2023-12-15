import React, { useState } from "react";
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

export default function CreationForm() {
  const [humidity, setHumidity] = useState({ value: "", error: "" });
  const [incubationDuration, setIncubationDuration] = useState({
    value: "",
    error: "",
  });
  const [name, setName] = useState({ value: "", error: "" });
  const [temperature, setTemperature] = useState({ value: "", error: "" });
  const sessionInfo = useSession();

  if (!sessionInfo) {
    // Lidar com o caso em que sessionInfo é null
    return <Text>Session info not available</Text>;
  }

  const { session, isLoading } = sessionInfo;

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  const onCreatePressed = async () => {
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
    } else {
      try {
        const response = await createDeviceSetting(
          parseInt(session?.user.id || ""),
          parseFloat(temperature.value),
          parseFloat(incubationDuration.value),
          parseFloat(humidity.value),
          name.value
        );
        if (response) {
          Toast.show("Configuração criada com sucesso", toastSettings);

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
    }
  };

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
    width: 150,
    height: 150,
    marginBottom: 8,
  },
});
