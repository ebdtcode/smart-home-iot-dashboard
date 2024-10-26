#include <ArduinoJson.h>

// Pin definitions
const int PIR_PIN = 2;     // PIR sensor connected to digital pin 2
const int LED_PIN = 6;     // LED connected to digital pin 6
const int SOUND_PIN = A0;  // Sound sensor connected to analog pin A0

// Constants
const unsigned long SAMPLE_INTERVAL = 1000;  // Sampling interval in milliseconds
const int BAUD_RATE = 9600;
const size_t JSON_DOC_SIZE = 128;  // Calculated using ArduinoJson Assistant

// Global variables
int motionState = 0;
int soundLevel = 0;
int ledState = 0;  // Add this to track LED state
unsigned long lastMotionTime = 0;
const unsigned long LED_TIMEOUT = 5000; // 5 seconds timeout

// Serial command handling
String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(BAUD_RATE);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOUND_PIN, INPUT);
  inputString.reserve(200);
  
  // Wait for serial connection
  while (!Serial) {
    ; // Wait for serial port to connect
  }
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    handleSerialCommand();
    inputString = "";
    stringComplete = false;
  }

  // Read sensors
  motionState = digitalRead(PIR_PIN);
  soundLevel = analogRead(SOUND_PIN);
  
  // Update LED based on motion if not manually controlled
  if (motionState == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    ledState = 1;
    lastMotionTime = millis();
  } else if (millis() - lastMotionTime >= LED_TIMEOUT) {
    digitalWrite(LED_PIN, LOW);
    ledState = 0;
  }
  
  // Send data
  sendJsonData();
  delay(100);  // Small delay to prevent flooding
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}

void handleSerialCommand() {
  inputString.trim();
  
  if (inputString.length() > 0) {
    int command = inputString.toInt();
    
    // Handle LED control commands
    if (command == 1) {
      digitalWrite(LED_PIN, HIGH);
      ledState = 1;
    } else if (command == 0) {
      digitalWrite(LED_PIN, LOW);
      ledState = 0;
    }
    
    // Send immediate feedback
    sendJsonData();
  }
}

void sendJsonData() {
  StaticJsonDocument<JSON_DOC_SIZE> doc;
  
  // Add all data at once
  doc["motion"] = motionState;
  doc["sound"] = soundLevel;
  doc["led"] = ledState;  // Use ledState instead of reading pin
  doc["timestamp"] = millis();
  doc["status"] = 0;

  // Serialize the entire JSON object to a string
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send the complete JSON string in one go
  Serial.println(jsonString);
}
