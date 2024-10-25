#include <Arduino.h>
#include <ArduinoJson.h>

// Define pins for LEDs and button
const int redLEDPin = 4;
const int greenLEDPin = 3;
const int blueLEDPin = 2;
const int buttonPin = 8;

// Variable to track the current state of the traffic light
int currentState = 0;

void setup() {
  Serial.begin(9600);
  while (!Serial) continue;  // Wait for serial port to connect

  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP); // Use internal pull-up resistor

  // Initialize the traffic light to red
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, LOW);
  digitalWrite(blueLEDPin, LOW);

  sendStateToServer();
}

void loop() {
  static bool lastButtonState = HIGH;
  bool buttonState = digitalRead(buttonPin);

  // Check for button press (transition from HIGH to LOW)
  if (lastButtonState == HIGH && buttonState == LOW) {
    // Debounce delay
    delay(50);
    buttonState = digitalRead(buttonPin);
    if (buttonState == LOW) {
      // Cycle to the next state
      currentState = (currentState + 1) % 3;
      updateTrafficLight();
      sendStateToServer();  // Send the updated state to the server
    }
  }

  lastButtonState = buttonState;
  
  // Send state to server every second, even if there's no change
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 1000) {
    sendStateToServer();
    lastSendTime = millis();
  }
}

void updateTrafficLight() {
  switch (currentState) {
    case 0: // Red
      digitalWrite(redLEDPin, HIGH);
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(blueLEDPin, LOW);
      break;
    case 1: // Green
      digitalWrite(redLEDPin, LOW);
      digitalWrite(greenLEDPin, HIGH);
      digitalWrite(blueLEDPin, LOW);
      break;
    case 2: // Blue
      digitalWrite(redLEDPin, LOW);
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(blueLEDPin, HIGH);
      break;
  }
}

void sendStateToServer() {
  StaticJsonDocument<200> doc;
  doc["state"] = currentState;
  doc["buttonState"] = (digitalRead(buttonPin) == LOW) ? 1 : 0;
  doc["intensity"] = 100;

  String jsonString;
  serializeJson(doc, jsonString);
  Serial.println(jsonString);  // Make sure to use println to add a newline
  Serial.flush();  // Ensure all data is sent before moving on
}
