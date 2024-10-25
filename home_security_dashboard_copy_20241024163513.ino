#include <ArduinoJson.h>

// Pin definitions
const int pirPin = 2;      // PIR sensor
const int ledPin = 6;      // Output LED
const int soundPin = A0;   // Sound sensor
const int statusLed = 13;  // Built-in LED for status

// Constants for sensor calibration
const int SOUND_THRESHOLD = 100;
const unsigned long SEND_INTERVAL = 1000; // 1 second interval

void setup() {
  Serial.begin(9600);
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  pinMode(statusLed, OUTPUT);
  
  // Indicate successful setup
  digitalWrite(statusLed, HIGH);
}

void loop() {
  static unsigned long lastSendTime = 0;
  unsigned long currentTime = millis();

  // Read sensors
  int motionValue = digitalRead(pirPin);
  int soundValue = analogRead(soundPin);
  
  // Update LED state based on motion
  digitalWrite(ledPin, motionValue);

  // Send data at regular intervals
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    // Create JSON document
    StaticJsonDocument<200> doc;
    
    doc["motion"] = motionValue;
    doc["sound"] = soundValue;
    doc["led"] = digitalRead(ledPin);
    doc["timestamp"] = currentTime;
    doc["status"] = 1;  // System status OK

    // Serialize and send
    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println(jsonString);

    lastSendTime = currentTime;
  }
}
