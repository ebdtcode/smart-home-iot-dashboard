int pirPin = 2;    // PIR sensor connected to digital pin 2
int ledPin = 6;   // LED connected to digital pin 6 (built-in LED)
int soundPin = A0; // Sound sensor connected to analog pin A0

void setup() {
  Serial.begin(9600);      // Start serial communication
  pinMode(pirPin, INPUT);   // Set PIR pin as input
  pinMode(ledPin, OUTPUT);  // Set LED pin as output
}

void loop() {
  int motion = digitalRead(pirPin);   // Read PIR sensor
  int sound = analogRead(soundPin);   // Read sound sensor

  // Control the LED based on motion detection
  if (motion) {
    digitalWrite(ledPin, HIGH);  // Turn on LED
  } else {
    digitalWrite(ledPin, LOW);   // Turn off LED
  }

  // Create JSON string with motion, sound, and LED state
  String data = "{";
  data += "\"motion\":" + String(motion) + ",";
  data += "\"sound\":" + String(sound) + ",";
  data += "\"led\":" + String(digitalRead(ledPin));
  data += "}";

  // Send data over serial port
  Serial.println(data);

  delay(1000);  // Wait for 1 second before next reading
}
