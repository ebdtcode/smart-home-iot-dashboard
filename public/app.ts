// Convert raw sound sensor value to decibels (dB)
function convertToDecibels(rawValue: number): number {
    const voltage = (rawValue / 1023.0) * 5.0; // Assuming 5V reference
    const decibels = 20 * Math.log10(voltage / 0.00631); // Arbitrary reference value
    return Math.max(0, Math.round(decibels)); // Ensure non-negative dB value
  }
  
  // Update temperature color based on the temperature value
  function updateTemperatureColor(temperature: number) {
    const temperatureCard = document.getElementById('temperature-card')! as HTMLElement;
  
    // Clear previous classes
    temperatureCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
  
    // Apply new color based on the temperature value
    if (temperature < 25) {
      temperatureCard.classList.add('bg-green-50'); // Normal temperature
    } else if (temperature < 35) {
      temperatureCard.classList.add('bg-orange-100'); // Warm temperature
    } else {
      temperatureCard.classList.add('bg-red-200'); // Hot temperature
    }
  }
  
  // Update humidity color based on the humidity value
  function updateHumidityColor(humidity: number) {
    const humidityCard = document.getElementById('humidity-card')! as HTMLElement;
  
    // Clear previous classes
    humidityCard.classList.remove('bg-green-50', 'bg-orange-100', 'bg-red-200');
  
    // Apply new color based on the humidity value
    if (humidity < 50) {
      humidityCard.classList.add('bg-green-50'); // Normal humidity
    } else if (humidity < 70) {
      humidityCard.classList.add('bg-orange-100'); // High humidity warning
    } else {
      humidityCard.classList.add('bg-red-200'); // Very high humidity
    }
  }
  
  // Update light color based on the light level
  function updateLightColor(lightLevel: number) {
    const lightCard = document.getElementById('light-card')! as HTMLElement;
  
    // Clear previous classes
    lightCard.classList.remove('bg-yellow-50', 'bg-yellow-100', 'bg-yellow-300');
  
    // Apply new color based on the light level
    if (lightLevel < 300) {
      lightCard.classList.add('bg-yellow-300'); // Low light
    } else if (lightLevel < 600) {
      lightCard.classList.add('bg-yellow-100'); // Medium light
    } else {
      lightCard.classList.add('bg-yellow-50'); // Bright light
    }
  }
  
  // Fetch data from the backend and update the UI
  async function fetchData(): Promise<void> {
    try {
      const response = await fetch('/data');
      const data = await response.json();
  
      // Update the temperature, humidity, and light levels
      document.getElementById('temperature')!.textContent = `${data.temperature} °C`;
      document.getElementById('humidity')!.textContent = `${data.humidity} %`;
      document.getElementById('light')!.textContent = data.light.toString();
  
      // Convert sound level to decibels and update the progress bar
      const soundLevel = convertToDecibels(data.sound);
      document.getElementById('sound-level')!.textContent = `${soundLevel} dB`;
  
      const soundBar = document.getElementById('sound-bar')! as HTMLElement;
      soundBar.style.width = `${Math.min(soundLevel, 100)}%`; // Cap width at 100%
  
      // Update colors for temperature, humidity, and light indicators
      updateTemperatureColor(data.temperature);
      updateHumidityColor(data.humidity);
      updateLightColor(data.light);
  
      // Update the timestamp
      document.getElementById('timestamp')!.textContent = new Date(data.timestamp).toLocaleString();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  // Fetch data initially and every 2 seconds
  fetchData();
  setInterval(fetchData, 2000);
  