import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MAX_HEIGHT = 200;
const TOLERANCE = 0.05; // 10% de tolerância, ajustado para o exemplo

const SensorChart = ({
  idealTemperature,
  idealHumidity,
  temperatureSensor,
  humiditySensor,
}: {
  idealTemperature: number;
  idealHumidity: number;
  temperatureSensor: number;
  humiditySensor: number;
}) => {
  // Altura do ponto do sensor
  const temperatureDotHeight =
    (temperatureSensor / (idealTemperature * 2)) * MAX_HEIGHT;
  const humidityDotHeight = (humiditySensor / (idealHumidity * 2)) * MAX_HEIGHT;

  // Define a altura para a faixa de tolerância (10% acima e abaixo da temperatura/umidade ideal)
  const toleranceHeight = TOLERANCE * MAX_HEIGHT * 2;

  // Gera labels de escala de 10 em 10 graus
  const scaleTemperatureMarks = Array.from(
    { length: (idealTemperature * 1.1) / 10 + 1 },
    (_, i) => i * 15
  );

  const scaleHumidityMarks = Array.from(
    { length: (idealHumidity * 0.9) / 10 + 1 },
    (_, i) => i * 20
  );

  // Verifica se o ponto está dentro da faixa de tolerância
  const isTemperatureWithinTolerance =
    temperatureSensor >= idealTemperature * (1 - TOLERANCE) &&
    temperatureSensor <= idealTemperature * (1 + TOLERANCE);
  const isHumidityWithinTolerance =
    humiditySensor >= idealHumidity * (1 - TOLERANCE) &&
    humiditySensor <= idealHumidity * (1 + TOLERANCE);

  // Cor de fundo baseada na tolerância
  const temperatureBackgroundColor = isTemperatureWithinTolerance
    ? "green"
    : "red";
  const humidityBackgroundColor = isHumidityWithinTolerance ? "green" : "red";

  return  (
    <View style={styles.container}>
      {/* Gráfico de Temperatura */}
      <View style={styles.chartContainer}>
        <View style={styles.scaleContainer}>
          {scaleTemperatureMarks.map((mark) => (
            <ScaleLabel
              key={mark}
              value={mark}
              maxValue={idealTemperature * 2}
            />
          ))}
        </View>
        {/* Faixa de Tolerância */}
        <View
          style={[
            styles.toleranceBar,
            {
              backgroundColor: temperatureBackgroundColor,
              height: toleranceHeight,
            },
          ]}
        />

        {/* Ponto da Temperatura Atual */}
        <View
          style={[
            styles.dot,
            { bottom: temperatureDotHeight - styles.dot.height / 2 },
          ]}
        />
        <Text style={styles.label}>Temperatura</Text>
      </View>

      {/* Gráfico de Umidade */}
      <View style={styles.chartContainer}>
        <View style={styles.scaleContainer}>
          {scaleHumidityMarks.map((mark) => (
            <ScaleLabel key={mark} value={mark} maxValue={idealHumidity * 2} />
          ))}
        </View>
        {/* Faixa de Tolerância */}
        <View
          style={[
            styles.toleranceBar,
            {
              backgroundColor: humidityBackgroundColor,
              height: toleranceHeight,
            },
          ]}
        />

        {/* Ponto da Umidade Atual */}
        <View
          style={[
            styles.dot,
            { bottom: humidityDotHeight - styles.dot.height / 2 },
          ]}
        />
        <Text style={styles.label}>Umidade</Text>
      </View>
    </View>
  );
};

const ScaleLabel = ({
  value,
  maxValue,
}: {
  value: number;
  maxValue: number;
}) => {
  const yPos = (value / maxValue) * MAX_HEIGHT;
  return (
    <Text style={[styles.scaleLabel, { bottom: yPos - 10 }]}>{value}</Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: MAX_HEIGHT + 50, // altura total do gráfico + espaço para o label
  },
  scaleContainer: {
    position: "absolute",
    height: MAX_HEIGHT,
    justifyContent: "space-between",
    left: 0,
  },
  chartContainer: {
    backgroundColor: "#2d2d2d",
    width: 100, // Ajuste a largura conforme necessário
    alignItems: "center",
    height: MAX_HEIGHT,
    position: "relative",
    marginLeft: 30, // Espaço para as labels de escala
  },
  toleranceBar: {
    backgroundColor: "green",
    width: "100%",
    position: "absolute",
    bottom: MAX_HEIGHT / 2 - TOLERANCE * MAX_HEIGHT, // Centralizar a faixa de tolerância
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "white",
    position: "absolute",
  },
  label: {
    color: "white",
    position: "absolute",
    bottom: -20, // Ajuste conforme necessário
  },
  scaleLabel: {
    color: "white",
    position: "absolute",
    left: -25, // Ajuste conforme necessário para alinhar as label
    fontSize: 10,
  },
});

export default SensorChart;
