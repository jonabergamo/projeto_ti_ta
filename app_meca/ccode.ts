export const Code = (
  jwt: string,
  unique_id: string,
  ssid: string,
  password: string
) => {
  return `
#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h> // Certifique-se de ter esta biblioteca instalada+
#include <string.h>

#define DHTPIN 15
#define DHTTYPE DHT11
#define ALERTA_TEMP_BAIXA_PIN 32
#define ALERTA_TEMP_ALTA_PIN 33

const char* ssid = "${ssid}";
const char* password = "${password}";
const char* serverName = "https://aguinaldomendes5.pythonanywhere.com/graphql";
const char* jwtToken = "${jwt}";
const char* unique_id = "${unique_id}";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao Wi-Fi...");
  }
  
  Serial.println("Conectado ao Wi-Fi");

  dht.begin();
  pinMode(ALERTA_TEMP_BAIXA_PIN, OUTPUT);
  pinMode(ALERTA_TEMP_ALTA_PIN, OUTPUT);
}

void loop() {

  float umidade = dht.readHumidity();
  float temperatura = dht.readTemperature();

  if (isnan(umidade) || isnan(temperatura)) {
    Serial.println("Falha na leitura do DHT11!");
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", String("JWT ") + jwtToken);

    // A consulta GraphQL é a mesma
    String graphqlQuery = "{\"query\":\"mutation MyMutation { updateIncubatorDevice(uniqueId: \\\"" + String(unique_id) + "\\\", humiditySensor: \\\"" + String(umidade) + "\\\", temperatureSensor: \\\"" + String(temperatura) + "\\\") { incubatorDevice { humiditySensor isOn startTime temperatureSensor uniqueId currentSetting { humidity temperature incubationDuration } } } }\"}";
    
    int httpResponseCode = http.POST(graphqlQuery);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, response);

      // Extraindo os valores da API
      float tempIdeal = doc["data"]["updateIncubatorDevice"]["incubatorDevice"]["currentSetting"]["temperature"];
      float umidadeIdeal = doc["data"]["updateIncubatorDevice"]["incubatorDevice"]["currentSetting"]["humidity"];
      bool isOn = doc["data"]["updateIncubatorDevice"]["incubatorDevice"]["isOn"]; // Extrai como string C

      Serial.println(isOn);
      Serial.println(tempIdeal);
      Serial.println(temperatura);

      const float TOLERANCIA = 0.5; // Meio grau de tolerância


      if (isOn) {
        if (temperatura > tempIdeal + TOLERANCIA) {
          Serial.println("1");
          digitalWrite(ALERTA_TEMP_BAIXA_PIN, HIGH); // Alerta de baixa temperatura desligado
          digitalWrite(ALERTA_TEMP_ALTA_PIN, LOW);   // Alerta de alta temperatura ligado
        } else if (temperatura < tempIdeal - TOLERANCIA) {
          Serial.println("2");
          digitalWrite(ALERTA_TEMP_BAIXA_PIN, LOW);  // Alerta de baixa temperatura ligado
          digitalWrite(ALERTA_TEMP_ALTA_PIN, HIGH);  // Alerta de alta temperatura desligado
        } else {
          Serial.println("3");
          // Dentro da faixa de tolerância, desligue ambos
          digitalWrite(ALERTA_TEMP_BAIXA_PIN, HIGH); // Ambos os alertas desligados
          digitalWrite(ALERTA_TEMP_ALTA_PIN, HIGH);  // Ambos os alertas desligados
        }
      } else {
        // Quando isOn é 0, desligue ambos os dispositivos
        Serial.println("4");
        digitalWrite(ALERTA_TEMP_BAIXA_PIN, HIGH); // Ambos os alertas desligados
        digitalWrite(ALERTA_TEMP_ALTA_PIN, HIGH);  // Ambos os alertas desligados
      }



    } else {
      Serial.print("Erro no código HTTP: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Desconectado do Wi-Fi");
  }

  delay(2000); // Aguarda 2 segundos para a próxima leitura
}
    `;
};
