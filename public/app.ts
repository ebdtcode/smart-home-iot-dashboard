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
    const response = await fetch('/data/environment');
    const data = await response.json();
    document.getElementById('temperature')!.textContent = `${data.temperature} °C`;
    document.getElementById('humidity')!.textContent = `${data.humidity} %`;
    document.getElementById('light')!.textContent = `${data.light} lux`;
    updateSoundLevel(data.sound);
    updateTemperatureColor(data.temperature);
    updateHumidityColor(data.humidity);
    updateLightColor(data.light);
    document.getElementById('timestamp')!.textContent = new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching environmental data:', error);
  }
}

// Fetch and update security dashboard data
async function fetchSecurityData() {
  try {
    const response = await fetch('/data/security');
    const data = await response.json();
    updateMotionStatus(data.motion, data.led);
    updateSoundLevel(data.sound);
    document.getElementById('timestamp')!.textContent = new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching security data:', error);
  }
}

// Determine which dashboard to load data for
function determineDashboard() {
  if (document.getElementById('temperature')) {
    fetchEnvironmentalData();
    setInterval(fetchEnvironmentalData, 2000);
  } else {
    fetchSecurityData();
    setInterval(fetchSecurityData, 2000);
  }
}

// Start the appropriate data fetcher
determineDashboard();
