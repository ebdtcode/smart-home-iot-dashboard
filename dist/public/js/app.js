"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Convert raw sound sensor value to decibels (dB)
function convertToDecibels(rawValue) {
    const voltage = (rawValue / 1023.0) * 5.0; // Assuming 5V reference
    const decibels = 20 * Math.log10(voltage / 0.00631);
    return Math.max(0, Math.round(decibels)); // Ensure non-negative dB value
}
// Update temperature card background based on the temperature value
function updateTemperatureColor(temperature) {
    const temperatureCard = document.getElementById('temperature-card');
    temperatureCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
    if (temperature < 25)
        temperatureCard.classList.add('bg-green-50');
    else if (temperature < 35)
        temperatureCard.classList.add('bg-orange-100');
    else
        temperatureCard.classList.add('bg-red-200');
}
// Update humidity card background based on the humidity value
function updateHumidityColor(humidity) {
    const humidityCard = document.getElementById('humidity-card');
    humidityCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
    if (humidity < 50)
        humidityCard.classList.add('bg-green-50');
    else if (humidity < 70)
        humidityCard.classList.add('bg-orange-100');
    else
        humidityCard.classList.add('bg-red-200');
}
// Update light card background based on the light level
function updateLightColor(lightLevel) {
    const lightCard = document.getElementById('light-card');
    lightCard.classList.remove('bg-yellow-50', 'bg-yellow-100', 'bg-yellow-300');
    if (lightLevel < 300)
        lightCard.classList.add('bg-yellow-300');
    else if (lightLevel < 600)
        lightCard.classList.add('bg-yellow-100');
    else
        lightCard.classList.add('bg-yellow-50');
}
// Update motion detection status and LED state
function updateMotionStatus(motion, led) {
    const motionElement = document.getElementById('motion');
    const ledLight = document.getElementById('led-light');
    motionElement.textContent = motion ? 'Yes' : 'No';
    ledLight.classList.remove('bg-green-500', 'bg-gray-400');
    ledLight.classList.add(led ? 'bg-green-500' : 'bg-gray-400');
}
// Update sound level progress bar
function updateSoundLevel(rawValue) {
    const soundLevel = convertToDecibels(rawValue);
    const soundBar = document.getElementById('sound-bar');
    soundBar.style.width = `${Math.min(soundLevel, 100)}%`;
    document.getElementById('sound-level').textContent = `${soundLevel} dB`;
}
// Fetch and update environmental dashboard data
function fetchEnvironmentalData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/data/environment');
            const data = yield response.json();
            document.getElementById('temperature').textContent = `${data.temperature} °C`;
            document.getElementById('humidity').textContent = `${data.humidity} %`;
            document.getElementById('light').textContent = `${data.light} lux`;
            updateSoundLevel(data.sound);
            updateTemperatureColor(data.temperature);
            updateHumidityColor(data.humidity);
            updateLightColor(data.light);
            document.getElementById('timestamp').textContent = new Date().toLocaleString();
        }
        catch (error) {
            console.error('Error fetching environmental data:', error);
        }
    });
}
// Fetch and update security dashboard data
function fetchSecurityData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/data/security');
            const data = yield response.json();
            updateMotionStatus(data.motion, data.led);
            updateSoundLevel(data.sound);
            document.getElementById('timestamp').textContent = new Date().toLocaleString();
        }
        catch (error) {
            console.error('Error fetching security data:', error);
        }
    });
}
// Update light dashboard
function updateLightDashboard(data) {
    console.log("Updating light dashboard with data:", data);
    const redLed = document.getElementById('red-led');
    const greenLed = document.getElementById('green-led');
    const blueLed = document.getElementById('blue-led');
    const buttonStateElement = document.getElementById('button-state');
    const currentStateElement = document.getElementById('current-state');
    if (redLed && greenLed && blueLed) {
        // Remove all classes first
        redLed.classList.remove('led-on', 'led-off');
        greenLed.classList.remove('led-on', 'led-off');
        blueLed.classList.remove('led-on', 'led-off');
        // Then add the appropriate class
        redLed.classList.add(data.state === 0 ? 'led-on' : 'led-off');
        greenLed.classList.add(data.state === 1 ? 'led-on' : 'led-off');
        blueLed.classList.add(data.state === 2 ? 'led-on' : 'led-off');
        console.log("LED states updated:", {
            red: data.state === 0 ? 'on' : 'off',
            green: data.state === 1 ? 'on' : 'off',
            blue: data.state === 2 ? 'on' : 'off'
        });
    }
    else {
        console.error("LED elements not found");
    }
    if (buttonStateElement) {
        buttonStateElement.textContent = data.buttonState === 1 ? 'Pressed' : 'Not Pressed';
        console.log("Updated button state:", buttonStateElement.textContent);
    }
    else {
        console.error("Button state element not found");
    }
    if (currentStateElement) {
        let stateText = '';
        switch (data.state) {
            case 0:
                stateText = 'Red';
                break;
            case 1:
                stateText = 'Green';
                break;
            case 2:
                stateText = 'Blue';
                break;
            default: stateText = 'Unknown';
        }
        currentStateElement.textContent = stateText;
        console.log("Updated current state:", stateText);
    }
    else {
        console.error("Current state element not found");
    }
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
        const now = new Date();
        const formattedTime = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).format(now);
        timestampElement.textContent = formattedTime;
    }
    else {
        console.error("Timestamp element not found");
    }
}
// Fetch and update smart light data
function fetchLightData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/data/light');
            const data = yield response.json();
            console.log("Fetched light data:", data); // Add this line
            updateLightDashboard(data);
        }
        catch (error) {
            console.error('Error fetching light data:', error);
        }
    });
}
function initializeLightDashboard() {
    console.log("Initializing light dashboard");
    // Add click event listeners to LED elements
    const redLed = document.getElementById('red-led');
    const greenLed = document.getElementById('green-led');
    const blueLed = document.getElementById('blue-led');
    if (redLed && greenLed && blueLed) {
        redLed.addEventListener('click', () => handleLedClick(0));
        greenLed.addEventListener('click', () => handleLedClick(1));
        blueLed.addEventListener('click', () => handleLedClick(2));
        console.log("LED click handlers attached");
    }
    else {
        console.error("Could not find LED elements");
    }
    fetchLightData(); // Fetch immediately
    setInterval(fetchLightData, 1000); // Then fetch every second
}
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    const lightDashboard = document.getElementById('traffic-light-card');
    console.log("Light dashboard element:", lightDashboard); // Add this line
    if (lightDashboard) {
        console.log("Light dashboard detected, initializing...");
        initializeLightDashboard();
    }
    else {
        console.error("Light dashboard not detected");
    }
});
// Update handleLedClick to include more logging
function handleLedClick(state) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`LED clicked with state: ${state}`);
        try {
            const response = yield fetch('/light/setState', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state })
            });
            console.log('Response status:', response.status);
            if (response.ok) {
                const data = yield response.json();
                console.log('Response data:', data);
                updateLightDashboard(data);
            }
            else {
                console.error('Server returned error:', response.status);
            }
        }
        catch (error) {
            console.error('Error setting light state:', error);
        }
    });
}
// Make handleLedClick available globally
window.handleLedClick = handleLedClick;
// Make handleLedClick available globally
window.handleLedClick = handleLedClick;
