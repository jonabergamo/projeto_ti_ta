import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";

interface Device {
  startTime: string | null;
  // Adicione outros campos relevantes para o tipo Device aqui
}

interface IncubationTimerProps {
  device: Device;
  incubationDuration: number; // Duração da incubação em horas
}

const IncubationTimer: React.FC<IncubationTimerProps> = ({
  device,
  incubationDuration,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const updateTimer = () => {
      if (device && device.startTime) {
        const startTime = new Date(device.startTime);
        const endTime = new Date(
          startTime.getTime() + incubationDuration * 3600000
        );
        const now = new Date();
        const timeLeft = endTime.getTime() - now.getTime(); // Subtrai 13 segundos

        if (timeLeft > 0) {
          let hours = Math.floor(timeLeft / (1000 * 60 * 60));
          let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeRemaining("Incubação concluída");
        }
      } else {
        setTimeRemaining("Não iniciado");
      }
    };

    // Chame updateTimer uma vez para sincronizar imediatamente
    updateTimer();

    // Atualize o temporizador a cada segundo
    timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [device, incubationDuration]);

  return <Text style={styles.deviceText}>{timeRemaining}</Text>;
};

const styles = StyleSheet.create({
  deviceText: {
    // Estilos para o texto
  },
});

export default IncubationTimer;
