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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: EnvironmentData = await response.json();
    console.log('Received environmental data:', data);

    // Verify DOM elements exist before updating
    const elements = {
      temperature: document.getElementById('temperature'),
      humidity: document.getElementById('humidity'),
      light: document.getElementById('light'),
      soundBar: document.getElementById('sound-bar'),
      soundLevel: document.getElementById('sound-level'),
      timestamp: document.getElementById('timestamp')
    };

    // Check if any elements are missing
    Object.entries(elements).forEach(([name, element]) => {
      if (!element) console.error(`Missing DOM element: ${name}`);
    });

    // Update elements if they exist
    if (elements.temperature) {
      elements.temperature.textContent = `${data.temperature.toFixed(1)} °C`;
      updateTemperatureColor(data.temperature);
    }

    if (elements.humidity) {
      elements.humidity.textContent = `${data.humidity.toFixed(1)} %`;
      updateHumidityColor(data.humidity);
    }

    if (elements.light) {
      elements.light.textContent = `${data.light} lux`;
      updateLightColor(data.light);
    }

    // Update sound level
    if (elements.soundBar && elements.soundLevel) {
      updateSoundLevel(data.sound);
    }

    // Update timestamp
    if (elements.timestamp) {
      elements.timestamp.textContent = new Date().toLocaleString();
    }

  } catch (error) {
    console.error('Error in fetchEnvironmentalData:', error);
  }
}

// Fetch and update security dashboard data
async function fetchSecurityData() {
  try {
    console.log('Fetching security data...'); // Add logging
    const response = await fetch('/data/security');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: SecurityData = await response.json();
    console.log('Received security data:', data);  // Add logging
    
    // Update UI elements
    updateMotionStatus(data.motion, data.led);
    updateSoundLevel(data.sound);
    document.getElementById('timestamp')!.textContent = new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching security data:', error);
  }
}

// Update light dashboard
function updateLightDashboard(data: LightData) {
  // Update button state
  const buttonStateElement = document.getElementById('button-state');
  if (buttonStateElement) {
    buttonStateElement.textContent = data.buttonState ? 'Pressed' : 'Released';
  }

  // Update current state with color
  const currentStateElement = document.getElementById('current-state');
  if (currentStateElement) {
    let stateText = '';
    let stateClass = '';
    
    switch(data.state) {
      case 0:
        stateText = 'Stop';
        stateClass = 'text-red-600';
        break;
      case 1:
        stateText = 'Go';
        stateClass = 'text-green-600';
        break;
      case 2:
        stateText = 'Alert';
        stateClass = 'text-blue-600';
        break;
      default:
        stateText = '--';
        stateClass = 'text-gray-600';
    }
    
    // Remove all possible state classes
    currentStateElement.classList.remove(
      'text-red-600', 
      'text-green-600', 
      'text-blue-600',
      'text-gray-600'
    );
    
    // Add the current state class and update text
    currentStateElement.classList.add(stateClass);
    currentStateElement.textContent = stateText;
  }

  // Update LED states
  updateLEDStates(data.state);

  // Update timestamp
  const timestampElement = document.getElementById('timestamp');
  if (timestampElement) {
    const now = new Date();
    timestampElement.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

function updateLEDStates(state: number) {
  const redLed = document.querySelector('#red-led .led');
  const greenLed = document.querySelector('#green-led .led');
  const blueLed = document.querySelector('#blue-led .led');

  // Reset all LEDs
  [redLed, greenLed, blueLed].forEach(led => {
    if (led) {
      led.classList.remove('led-on');
      led.classList.add('led-off');
    }
  });

  // Activate current LED
  const activeLed = state === 0 ? redLed : 
                    state === 1 ? greenLed : 
                    state === 2 ? blueLed : null;
  
  if (activeLed) {
    activeLed.classList.remove('led-off');
    activeLed.classList.add('led-on');
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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Response from server:', data);
    updateLightDashboard(data);
  } catch (error) {
    console.error('Error setting light state:', error);
  }
}

// Make handleLedClick available globally
(window as any).handleLedClick = handleLedClick;
