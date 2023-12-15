#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h> // Certifique-se de ter esta biblioteca instalada

#define DHTPIN 15
#define DHTTYPE DHT11
#define ALERTA_TEMP_BAIXA_PIN 5
#define ALERTA_TEMP_ALTA_PIN 4

const char* ssid = "S23dePaulo";
const char* password = "paulo1234";
const char* serverName = "https://aguinaldomendes5.pythonanywhere.com/graphql";
const char* jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvbmF0aGFuYmVyZ2FtbzE2QGdtYWlsLmNvbSIsImV4cCI6MTcwMjQyMDE5MSwib3JpZ0lhdCI6MTcwMjQxOTg5MX0.zkhNQB7naM1Xu6ZaiCyNsRoiHVlVNn38tC4pddjNYm0";
const char* unique_id = "158f9013-2de6-45d1-a652-8c6e55ba7f5f";

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
      bool isOn = doc["data"]["updateIncubatorDevice"]["incubatorDevice"]["isOn"];



    if(isOn){
      if (temperatura >= tempIdeal) {
        digitalWrite(ALERTA_TEMP_BAIXA_PIN, LOW);
        digitalWrite(ALERTA_TEMP_ALTA_PIN, HIGH);
      } else if (temperatura <= tempIdeal) {
        digitalWrite(ALERTA_TEMP_BAIXA_PIN, HIGH);
        digitalWrite(ALERTA_TEMP_ALTA_PIN, LOW);
      } else {
        digitalWrite(ALERTA_TEMP_BAIXA_PIN, LOW);
        digitalWrite(ALERTA_TEMP_ALTA_PIN, LOW);
      }
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