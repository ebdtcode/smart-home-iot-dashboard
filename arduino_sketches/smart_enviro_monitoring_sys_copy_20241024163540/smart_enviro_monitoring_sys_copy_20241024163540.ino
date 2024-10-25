#include <DHT.h>
#include <ArduinoJson.h>  // Add ArduinoJson library for better JSON handling

// Sensor configuration for Grove ports
#define DHT_PORT 2          // Connect DHT sensor to Digital port D2
#define LIGHT_SENSOR A0     // Connect Light sensor to Analog port A0
#define SOUND_SENSOR A1     // Connect Sound sensor to Analog port A1
#define SAMPLE_INTERVAL 2000 // Sampling interval in milliseconds

// Initialize the DHT sensor (DHT11 or DHT22)
DHT dht(DHT_PORT, DHT11);  // Adjust to DHT22 if needed

// Buffer for JSON document
StaticJsonDocument<200> doc;

void setup() {
  Serial.begin(9600);  // Start serial communication
  while (!Serial) {    // Wait for serial connection
    delay(10);
  }
  
  dht.begin();         // Initialize DHT sensor
  
  // Initialize analog pins
  pinMode(LIGHT_SENSOR, INPUT);
  pinMode(SOUND_SENSOR, INPUT);
  
  // Send initial status message
  Serial.println(F("{\"status\":\"Environmental monitoring system initialized\"}"));
}

void loop() {
  static unsigned long lastReadTime = 0;
  unsigned long currentTime = millis();

  // Check if it's time to take a new reading
  if (currentTime - lastReadTime >= SAMPLE_INTERVAL) {
    readAndSendSensorData();
    lastReadTime = currentTime;
  }
}

void readAndSendSensorData() {
  // Get current timestamp
  unsigned long currentTime = millis();  // Add this line
  
  // Read all sensors
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightLevel = analogRead(LIGHT_SENSOR);
  int soundLevel = analogRead(SOUND_SENSOR);

  // Clear previous JSON document
  doc.clear();

  // Check for DHT sensor errors
  if (isnan(temperature) || isnan(humidity)) {
    doc["error"] = F("Failed to read from DHT sensor");
  } else {
    // Add sensor readings to JSON document
    doc["temperature"] = roundToDecimal(temperature, 1);
    doc["humidity"] = roundToDecimal(humidity, 1);
    doc["light"] = lightLevel;
    doc["sound"] = soundLevel;
    doc["timestamp"] = currentTime;  // Now currentTime is defined
  }

  // Add status information
  doc["vcc"] = readVcc();
  doc["uptime"] = currentTime / 1000;  // Convert to seconds

  // Send the JSON data
  serializeJson(doc, Serial);
  Serial.println();
}

// Helper function to round floating point numbers
float roundToDecimal(float value, int decimals) {
  float multiplier = pow(10.0, decimals);
  return round(value * multiplier) / multiplier;
}

// Function to read system voltage
long readVcc() {
  #if defined(__AVR_ATmega32U4__) || defined(__AVR_ATmega1280__) || defined(__AVR_ATmega2560__)
    ADMUX = _BV(REFS0) | _BV(MUX4) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #elif defined (__AVR_ATtiny24__) || defined(__AVR_ATtiny44__) || defined(__AVR_ATtiny84__)
    ADMUX = _BV(MUX5) | _BV(MUX0);
  #elif defined (__AVR_ATtiny25__) || defined(__AVR_ATtiny45__) || defined(__AVR_ATtiny85__)
    ADMUX = _BV(MUX3) | _BV(MUX2);
  #else
    ADMUX = _BV(REFS0) | _BV(MUX3) | _BV(MUX2) | _BV(MUX1);
  #endif  

  delay(2); // Wait for Vref to settle
  ADCSRA |= _BV(ADSC); // Start conversion
  while (bit_is_set(ADCSRA,ADSC)); // Wait for conversion to complete

  uint8_t low  = ADCL; // must read ADCL first - it then locks ADCH  
  uint8_t high = ADCH; // unlocks both

  long result = (high<<8) | low;

  result = 1125300L / result; // Calculate Vcc (in mV); 1125300 = 1.1*1023*1000
  return result; // Vcc in millivolts
}
