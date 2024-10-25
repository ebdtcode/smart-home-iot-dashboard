# Smart Home Dashboard

A comprehensive IoT dashboard system that monitors environmental conditions, security status, and controls smart lighting using Arduino sensors and a Node.js/Express backend.

## 🚀 Features

- **Environmental Monitoring**: Temperature, humidity, light, and sound level tracking
- **Security System**: Motion detection and LED status indication
- **Smart Light Control**: Interactive light control with multiple states
- **Real-time Updates**: Live data updates from Arduino sensors
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 📋 Prerequisites

### Hardware Requirements
- Arduino Uno/Nano (3 units)
- Sensors:
  - DHT11/DHT22 (Temperature & Humidity)
  - LDR (Light)
  - Sound Sensor Module
  - PIR Motion Sensor
  - LEDs (Red, Green, Blue)
  - Push Button
- Jumper Wires
- Breadboard

### Software Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- Arduino IDE
- Git

## 🔧 Installation

### 1. Arduino Setup

1. Open Arduino IDE
2. Install required libraries:
   ```bash
   # Through Arduino Library Manager
   - ArduinoJson (v6.x)
   ```

3. Upload the respective sketches to each Arduino:
   - `environmental_monitor/environmental_monitor.ino`
   - `home_security_dashboard/home_security_dashboard.ino`
   - `smart_light_controller/smart_light_controller.ino`

4. Note down the COM ports for each Arduino

### 2. Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-home-dashboard.git
   cd smart-home-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure port settings:
   - Open `src/utils/constants.ts`
   - Update the `getPortPath` function with your Arduino COM ports:
   ```typescript
   export const getPortPath = (deviceType: 'environmental' | 'security' | 'light'): string => {
     const base = process.platform === 'win32' 
       ? 'COM'
       : process.platform === 'darwin'
       ? '/dev/tty.usbmodem'
       : '/dev/ttyACM';

     switch (deviceType) {
       case 'environmental':
         return `${base}21301`;  // Update with your port
       case 'security':
         return `${base}101`;    // Update with your port
       case 'light':
         return `${base}21201`;  // Update with your port
       default:
         return `${base}0`;
     }
   };
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## 🚀 Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Access the dashboard:
   - Open your browser and navigate to `http://localhost:3000`
   - Available routes:
     - `/` - Home page
     - `/monitor` - Environmental monitoring
     - `/home` - Security dashboard
     - `/light` - Smart light control

## 📐 Project Structure
<!-- TODO: Add project structure diagram -->