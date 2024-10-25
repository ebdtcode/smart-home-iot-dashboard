// Interfaces for different data types
interface EnvironmentData {
  temperature: number;
  humidity: number;
  light: number;
  sound: number;
}

interface SecurityData {
  motion: number;
  led: number;
  sound: number;
}

interface LightData {
  state: number;
  buttonState: number;
  intensity: number;
}

// Convert raw sound sensor value to decibels (dB)
function convertToDecibels(rawValue: number): number {
  const voltage = (rawValue / 1023.0) * 5.0; // Assuming 5V reference
  const decibels = 20 * Math.log10(voltage / 0.00631);
  return Math.max(0, Math.round(decibels)); // Ensure non-negative dB value
}

// Update temperature card background based on the temperature value
function updateTemperatureColor(temperature: number) {
  const temperatureCard = document.getElementById('temperature-card')!;
  temperatureCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
  if (temperature < 25) temperatureCard.classList.add('bg-green-50');
  else if (temperature < 35) temperatureCard.classList.add('bg-orange-100');
  else temperatureCard.classList.add('bg-red-200');
}

// Update humidity card background based on the humidity value
function updateHumidityColor(humidity: number) {
  const humidityCard = document.getElementById('humidity-card')!;
  humidityCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
  if (humidity < 50) humidityCard.classList.add('bg-green-50');
  else if (humidity < 70) humidityCard.classList.add('bg-orange-100');
  else humidityCard.classList.add('bg-red-200');
}

// Update light card background based on the light level
function updateLightColor(lightLevel: number) {
  const lightCard = document.getElementById('light-card')!;
  lightCard.classList.remove('bg-yellow-50', 'bg-yellow-100', 'bg-yellow-300');
  if (lightLevel < 300) lightCard.classList.add('bg-yellow-300');
  else if (lightLevel < 600) lightCard.classList.add('bg-yellow-100');
  else lightCard.classList.add('bg-yellow-50');
}

// Update motion detection status and LED state
function updateMotionStatus(motion: number, led: number) {
  const motionElement = document.getElementById('motion')!;
  const ledLight = document.getElementById('led-light')! as HTMLElement;
  motionElement.textContent = motion ? 'Yes' : 'No';
  ledLight.classList.remove('bg-green-500', 'bg-gray-400');
  ledLight.classList.add(led ? 'bg-green-500' : 'bg-gray-400');
}

// Update sound level progress bar
function updateSoundLevel(rawValue: number) {
  const soundLevel = convertToDecibels(rawValue);
  const soundBar = document.getElementById('sound-bar')!;
  soundBar.style.width = `${Math.min(soundLevel, 100)}%`;
  document.getElementById('sound-level')!.textContent = `${soundLevel} dB`;
}

// Fetch and update environmental dashboard data
async function fetchEnvironmentalData() {
  try {
    console.log('Fetching environmental data...');
    const response = await fetch('/data/environment');
    const data: EnvironmentData = await response.json();
    console.log('Received environmental data:', data);

    // Update temperature
    const tempElement = document.getElementById('temperature');
    if (tempElement) {
      tempElement.textContent = `${data.temperature.toFixed(1)} °C`;
      updateTemperatureColor(data.temperature);
    }

    // Update humidity
    const humidElement = document.getElementById('humidity');
    if (humidElement) {
      humidElement.textContent = `${data.humidity.toFixed(1)} %`;
      updateHumidityColor(data.humidity);
    }

    // Update light level
    const lightElement = document.getElementById('light');
    if (lightElement) {
      lightElement.textContent = `${data.light} lux`;
      updateLightColor(data.light);
    }

    // Update sound level
    updateSoundLevel(data.sound);

    // Update timestamp
    const timestampElement = document.getElementById('timestamp');
    if (timestampElement) {
      timestampElement.textContent = new Date().toLocaleString();
    }

  } catch (error) {
    console.error('Error fetching environmental data:', error);
  }
}

// Fetch and update security dashboard data
async function fetchSecurityData() {
  try {
    const response = await fetch('/data/security');
    const data: SecurityData = await response.json();
    updateMotionStatus(data.motion, data.led);
    updateSoundLevel(data.sound);
    document.getElementById('timestamp')!.textContent = new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching security data:', error);
  }
}

// Update light dashboard
function updateLightDashboard(data: LightData) {
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
  } else {
    console.error("LED elements not found");
  }

  if (buttonStateElement) {
    buttonStateElement.textContent = data.buttonState === 1 ? 'Pressed' : 'Not Pressed';
    console.log("Updated button state:", buttonStateElement.textContent);
  } else {
    console.error("Button state element not found");
  }

  if (currentStateElement) {
    let stateText = '';
    switch (data.state) {
      case 0: stateText = 'Red'; break;
      case 1: stateText = 'Green'; break;
      case 2: stateText = 'Blue'; break;
      default: stateText = 'Unknown';
    }
    currentStateElement.textContent = stateText;
    console.log("Updated current state:", stateText);
  } else {
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
  } else {
    console.error("Timestamp element not found");
  }
}

// Fetch and update smart light data
async function fetchLightData() {
  try {
    const response = await fetch('/data/light');
    const data: LightData = await response.json();
    console.log("Fetched light data:", data);  // Add this line
    updateLightDashboard(data);
  } catch (error) {
    console.error('Error fetching light data:', error);
  }
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
  } else {
    console.error("Could not find LED elements");
  }

  fetchLightData(); // Fetch immediately
  setInterval(fetchLightData, 1000); // Then fetch every second
}

// Initialize the appropriate dashboard based on the current page
function initializeDashboard() {
  const currentPath = window.location.pathname;
  console.log('Initializing dashboard for path:', currentPath);

  switch (currentPath) {
    case '/monitor':
      console.log('Starting environmental monitoring');
      fetchEnvironmentalData(); // Initial fetch
      setInterval(fetchEnvironmentalData, 1000); // Update every second
      break;
    
    case '/home':
      console.log('Starting security monitoring');
      fetchSecurityData(); // Initial fetch
      setInterval(fetchSecurityData, 1000); // Update every second
      break;
    
    case '/light':
      console.log('Starting light monitoring');
      initializeLightDashboard();
      break;
  }
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded and parsed");
  initializeDashboard();
});

// Update handleLedClick to include more logging
async function handleLedClick(state: number) {
  console.log(`LED clicked with state: ${state}`);
  try {
    const response = await fetch('/light/setState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data: LightData = await response.json();
      console.log('Response data:', data);
      updateLightDashboard(data);
    } else {
      console.error('Server returned error:', response.status);
    }
  } catch (error) {
    console.error('Error setting light state:', error);
  }
}

// Make handleLedClick available globally
(window as any).handleLedClick = handleLedClick;

// Make handleLedClick available globally
(window as any).handleLedClick = handleLedClick;
