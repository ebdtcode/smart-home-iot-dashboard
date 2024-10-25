#include <ArduinoJson.h>

// Pin definitions
const int PIR_PIN = 2;     // PIR sensor connected to digital pin 2
const int LED_PIN = 6;     // LED connected to digital pin 6
const int SOUND_PIN = A0;  // Sound sensor connected to analog pin A0

// Constants
const unsigned long SAMPLE_INTERVAL = 1000;  // Sampling interval in milliseconds
const int BAUD_RATE = 9600;
const size_t JSON_DOC_SIZE = 128;  // Calculated using ArduinoJson Assistant

// Variables to store sensor readings
int motionState = 0;
int soundLevel = 0;
unsigned long lastReadTime = 0;

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Wait for serial connection
  while (!Serial) {
    ; // Wait for serial port to connect
  }
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastReadTime >= SAMPLE_INTERVAL) {
    readSensors();
    updateLED();
    sendJsonData();
    lastReadTime = currentTime;
  }
}

void readSensors() {
  motionState = digitalRead(PIR_PIN);
  soundLevel = analogRead(SOUND_PIN);
}

void updateLED() {
  digitalWrite(LED_PIN, motionState ? HIGH : LOW);
}

void sendJsonData() {
  StaticJsonDocument<JSON_DOC_SIZE> doc;
  
  // Add sensor data to JSON document
  doc["motion"] = motionState;
  doc["sound"] = soundLevel;
  doc["led"] = digitalRead(LED_PIN);
  doc["timestamp"] = millis();
  
  // Add error checking for serialization
  if (serializeJson(doc, Serial) == 0) {
    Serial.println(F("{\"error\":\"Failed to write JSON\"}"));
  } else {
    Serial.println(); // Add newline after JSON
  }
}
