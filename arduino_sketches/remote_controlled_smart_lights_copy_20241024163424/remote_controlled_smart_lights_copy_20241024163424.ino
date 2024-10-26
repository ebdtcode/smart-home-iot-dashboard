#include <Arduino.h>
#include <ArduinoJson.h>

// Define pins for LEDs and button
const int redLEDPin = 4;    // Verify this matches your physical connection
const int greenLEDPin = 3;  // Verify this matches your physical connection
const int blueLEDPin = 2;   // Verify this matches your physical connection
const int buttonPin = 8;

// Variable to track the current state of the traffic light
int currentState = 0;

void setup() {
  Serial.begin(9600);
  
  // Wait for serial port to connect
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
  
  // Set pin modes
  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
  
  // Initially turn off all LEDs
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, LOW);
  digitalWrite(blueLEDPin, LOW);
  
  // Send initial state
  Serial.println("Arduino Ready");
  sendStateToServer();
}

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    // Enhanced debugging
    Serial.println("-------------------");
    Serial.print("Received raw input: '");
    Serial.print(input);
    Serial.println("'");
    
    // Ensure valid state conversion
    int newState = input.toInt();
    Serial.print("Converted to number: ");
    Serial.println(newState);
    
    if (newState >= 0 && newState <= 2) {
      // Force all LEDs off first
      digitalWrite(redLEDPin, LOW);
      digitalWrite(greenLEDPin, LOW);
      digitalWrite(blueLEDPin, LOW);
      
      currentState = newState;
      
      // Debug pin states
      Serial.print("Setting new state: ");
      Serial.println(currentState);
      
      updateTrafficLight();
      
      // Verify pin states
      Serial.print("Red Pin State: ");
      Serial.println(digitalRead(redLEDPin));
      Serial.print("Green Pin State: ");
      Serial.println(digitalRead(greenLEDPin));
      Serial.print("Blue Pin State: ");
      Serial.println(digitalRead(blueLEDPin));
      
      sendStateToServer();
    } else {
      Serial.println("Invalid state received");
    }
    Serial.println("-------------------");
  }
  
  // Remove any delay here if present
  // Only handle button press and state updates
  static bool lastButtonState = HIGH;
  bool buttonState = digitalRead(buttonPin);

  if (lastButtonState == HIGH && buttonState == LOW) {
    delay(50); // Debounce
    buttonState = digitalRead(buttonPin);
    if (buttonState == LOW) {
      currentState = (currentState + 1) % 3;
      updateTrafficLight();
      sendStateToServer();
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
  // First, ensure all LEDs are off
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, LOW);
  digitalWrite(blueLEDPin, LOW);
  delay(50); // Small delay to ensure LEDs are off
  
  // Then set the correct LED based on state
  switch (currentState) {
    case 0: // Red
      digitalWrite(redLEDPin, HIGH);
      Serial.println("Setting RED ON");
      break;
    case 1: // Green
      digitalWrite(greenLEDPin, HIGH);
      Serial.println("Setting GREEN ON");
      break;
    case 2: // Blue
      digitalWrite(blueLEDPin, HIGH);
      Serial.println("Setting BLUE ON");
      break;
  }
  
  // Debug output
  Serial.print("DEBUG: Current state is: ");
  Serial.println(currentState);
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