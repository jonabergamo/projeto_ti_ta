import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { theme } from "../core/theme";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import IncubationTimer from "./incubationTimer";

type ShureDeleteModalType = {
  visible: boolean;
  onSelect?: (device: IncubatorDeviceType) => void;
  onCancel?: () => void;
  devices: IncubatorDeviceType[];
};

type IncubatorDeviceType = {
  __typename: string;
  humiditySensor: number;
  isOn: boolean;
  name: string;
  startTime: any;
  temperatureSensor: number;
  lastCompletionData: Date;
  uniqueId: string;
  currentSetting: {
    name: String;
    temperature: number;
    humidity: number;
    incubationDuration: number;
    id: number;
  };
};

export default function DevicesModal({
  visible,
  onSelect,
  onCancel,
  devices,
}: ShureDeleteModalType) {
  const scrollViewRef = useRef<any>();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
            style={styles.scrollView}
            // refreshControl={
            //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            // }
          >
            <Text style={{ color: "white", fontSize: 25 }}>
              Escolha um dispositivo:
            </Text>
            {devices &&
              devices.map((device, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.settingItem}
                  onPress={() => {
                    if (onSelect) {
                      onSelect(device);
                    }
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
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 3,
    backgroundColor: theme.colors.surface,
    borderRadius: 5,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
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
    marginHorizontal: 2, // Espaçamento horizontal
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
    color: "white",
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
