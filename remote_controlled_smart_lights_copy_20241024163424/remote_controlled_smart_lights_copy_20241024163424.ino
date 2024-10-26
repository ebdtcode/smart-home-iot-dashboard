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
  // Handle serial communication first
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    
    // Add debounce delay to prevent button interference
    delay(50);
    
    // Enhanced debugging
    Serial.println("-------------------");
    Serial.print("Received raw input: '");
    Serial.print(input);
    Serial.println("'");
    
    // Check if input is JSON
    if (input.startsWith("{")) {
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, input);
      
      if (!error && doc.containsKey("led")) {
        int newState = doc["led"].as<int>();
        if (newState >= 0 && newState <= 2) {
          // Turn off all LEDs before changing state
          digitalWrite(redLEDPin, LOW);
          digitalWrite(greenLEDPin, LOW);
          digitalWrite(blueLEDPin, LOW);
          
          currentState = newState;
          updateTrafficLight();
          sendStateToServer();
          
          // Add a small delay after processing serial command
          delay(50);
          return; // Exit loop to prevent button interference
        }
      }
    } else {
      // Existing numeric state handling
      int newState = input.toInt();
      Serial.print("Converted to number: ");
      Serial.println(newState);
      
      if (newState >= 0 && newState <= 2) {
        digitalWrite(redLEDPin, LOW);
        digitalWrite(greenLEDPin, LOW);
        digitalWrite(blueLEDPin, LOW);
        
        currentState = newState;
        
        Serial.print("Setting new state: ");
        Serial.println(currentState);
        
        updateTrafficLight();
        
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
  }
  
  // Handle button press with improved debouncing
  static unsigned long lastButtonPress = 0;
  static bool lastButtonState = HIGH;
  bool buttonState = digitalRead(buttonPin);

  if (buttonState != lastButtonState) {
    if (millis() - lastButtonPress > 200) { // Increased debounce time
      if (buttonState == LOW) {
        currentState = (currentState + 1) % 3;
        updateTrafficLight();
        sendStateToServer();
        lastButtonPress = millis();
      }
    }
    lastButtonState = buttonState;
  }
  
  // Send state periodically
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
  
  // Create the main object entries
  doc["state"] = currentState;
  doc["buttonState"] = (digitalRead(buttonPin) == LOW) ? 1 : 0;
  doc["intensity"] = 100;
  
  // Create the activeLED object correctly
  JsonObject activeLED = doc.createNestedObject("activeLED");
  activeLED["red"] = digitalRead(redLEDPin);
  activeLED["green"] = digitalRead(greenLEDPin);
  activeLED["blue"] = digitalRead(blueLEDPin);

  String jsonString;
  serializeJson(doc, jsonString);
  Serial.println(jsonString);
  Serial.flush();
}
