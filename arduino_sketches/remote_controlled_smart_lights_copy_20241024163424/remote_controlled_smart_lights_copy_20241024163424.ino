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
  
  // Wait for serial port to connect
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
  
  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  
  // Send initial state
  Serial.println("Arduino Ready");
  sendStateToServer();
}

void loop() {
  // Check for serial commands
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    Serial.print("DEBUG: Received command: ");
    Serial.println(input);
    
    currentState = input.toInt();
    Serial.print("DEBUG: Setting state to: ");
    Serial.println(currentState);
    
    updateTrafficLight();
    sendStateToServer();
    
    // Confirm the state change
    Serial.print("DEBUG: State changed to: ");
    Serial.println(currentState);
  }

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
  Serial.print("DEBUG: Updating LEDs for state: ");
  Serial.println(currentState);
  
  switch (currentState) {
    case 0: // Red
      digitalWrite(redLEDPin, HIGH);
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(blueLEDPin, LOW);
      Serial.println("DEBUG: Red ON");
      break;
    case 1: // Green
      digitalWrite(redLEDPin, LOW);
      digitalWrite(greenLEDPin, HIGH);
      digitalWrite(blueLEDPin, LOW);
      Serial.println("DEBUG: Green ON");
      break;
    case 2: // Blue
      digitalWrite(redLEDPin, LOW);
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(blueLEDPin, HIGH);
      Serial.println("DEBUG: Blue ON");
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