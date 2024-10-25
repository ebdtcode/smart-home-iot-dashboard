import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import cors from 'cors';

// List all available ports at startup
SerialPort.list().then(ports => {
  console.log('Available ports:');
  ports.forEach(port => {
    console.log('Path:', port.path);
    console.log('Manufacturer:', port.manufacturer);
    console.log('Serial Number:', port.serialNumber);
    console.log('---');
  });
}).catch(err => {
  console.error('Error listing ports:', err);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Interfaces for sensor data
interface EnvironmentalData {
  temperature: number;
  humidity: number;
  light: number;
  sound: number;
}

interface SecurityData {
  motion: number;
  sound: number;
  led: number;
}

interface LightData {
  state: number;
  buttonState: number;
  intensity: number;
}

// Default data
let isPortReady = false;
const ARDUINO_PORT = '/dev/tty.usbmodem21201';  // Your Arduino port

// Add this initialization near the other interface declarations
let environmentalData: EnvironmentalData = {
  temperature: 0,
  humidity: 0,
  light: 0,
  sound: 0
};

// Add this initialization near the other interface declarations
let securityData: SecurityData = {
  motion: 0,
  sound: 0,
  led: 0
};

// Create a single serial port instance
const lightPort = initializeSerialPort();
const parser = lightPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Handle incoming data from Arduino
parser.on('data', (data: string) => {
  try {
    console.log('Received from Arduino:', data);
    const parsedData = JSON.parse(data.trim());
    lightData = { ...lightData, ...parsedData };
    console.log('Updated light data:', lightData);
  } catch (error) {
    console.error('Error parsing Arduino data:', error);
  }
});

// Handle port errors
lightPort.on('error', (err) => {
  console.error('Serial port error:', err);
  isPortReady = false;
});

// Function to create a serial port connection with improved error handling
function createSerialConnection(portPath: string, baudRate: number, dataHandler: (data: any) => void) {
  try {
    console.log(`Attempting to connect to port: ${portPath}`);
    const port = new SerialPort({ path: portPath, baudRate: baudRate });
    console.log(`Successfully opened port: ${portPath}`);
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
    
    port.on("error", (err) => {
      console.error(`Error on port ${portPath}:`, err.message);
    });

    parser.on("data", (data: string) => {
      console.log(`Raw data received from ${portPath}:`, data);
      try {
        const parsedData = JSON.parse(data.trim());
        console.log(`Parsed data from ${portPath}:`, parsedData);
        dataHandler(parsedData);
      } catch (error) {
        console.error(`Error parsing data from ${portPath}:`, error);
      }
    });

    return port;
  } catch (error) {
    console.error(`Failed to open port ${portPath}:`, error);
    return null;
  }
}

// Create connections for each device
const environmentalPort = createSerialConnection(
  "/dev/tty.usbmodem21301",
  9600,
  (data) => {
    environmentalData = { ...environmentalData, ...data };
    console.log("Environmental Data:", environmentalData);
  }
);

const securityPort = createSerialConnection(
  "/dev/tty.usbmodem21301",
  9600,
  (data) => {
    securityData = { ...securityData, ...data };
    console.log("Security Data:", securityData);
  }
);

// Initialize serial port with auto-reconnect
function initializeSerialPort() {
  const portPath = process.platform === 'win32' 
    ? 'COM3'  // Windows
    : process.platform === 'darwin'
    ? '/dev/tty.usbmodem21201'  // macOS (might need adjustment)
    : '/dev/ttyACM0';  // Linux

  console.log('Attempting to connect to port:', portPath);

  const port = new SerialPort(
    {
      path: portPath,
      baudRate: 9600,
      autoOpen: false  // Don't open immediately
    }
  );

  port.on('error', (err) => {
    console.error('Serial port error:', err.message);
    lastSerialError = err;  // Add this line
    isPortReady = false;
    // Try to reconnect after 5 seconds
    setTimeout(() => {
      if (!port.isOpen) {
        console.log('Attempting to reconnect...');
        port.open();
      }
    }, 5000);
  });

  port.on('close', () => {
    console.log('Serial port closed');
    isPortReady = false;
  });

  port.on('open', () => {
    console.log('Serial port opened successfully');
    isPortReady = true;
  });

  // Try to open the port
  port.open((err) => {
    if (err) {
      console.error('Error opening port:', err.message);
      isPortReady = false;
    } else {
      console.log('Port opened successfully');
      isPortReady = true;
    }
  });

  return port;
}

// Middleware for CORS and static files
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist/public')));
app.use('/js', express.static(path.join(__dirname, '../dist/public/js')));

// Add body parser middleware after the existing middleware
app.use(express.json());

// Routes for HTML pages
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/index.html")));
app.get("/home", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/monitor.html")));
app.get("/light", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/light.html")));

// API routes to fetch data
app.get("/data/environment", (_, res) => {
  console.log("Sending environmental data:", environmentalData);
  res.json(environmentalData);
});

app.get("/data/security", (_, res) => {
  console.log("Sending security data:", securityData);
  res.json(securityData);
});

app.get("/data/light", (_, res) => {
  console.log("Sending light data:", lightData);
  res.json(lightData);
});

// Update the setState route with better error handling
app.post("/light/setState", (req, res) => {
  const { state } = req.body;
  console.log('Received state change request:', state);

  if (!isPortReady) {
    console.error('Port not ready');
    return res.status(500).json({ error: 'Arduino not connected' });
  }

  if (typeof state !== 'number' || state < 0 || state > 2) {
    console.error('Invalid state:', state);
    return res.status(400).json({ error: 'Invalid state' });
  }

  const command = `${state}\n`;
  console.log('Sending command to Arduino:', command);

  lightPort.write(command, (writeError) => {
    if (writeError) {
      console.error('Write error:', writeError);
      return res.status(500).json({ error: 'Failed to write to Arduino' });
    }

    // Wait briefly for Arduino to process the command
    setTimeout(() => {
      lightData.state = state;
      console.log('Updated state:', lightData);
      res.json(lightData);
    }, 100);
  });
});

// Add a status endpoint to check Arduino connection
app.get("/light/status", (_, res) => {
  res.json({
    isConnected: isPortReady,
    portPath: lightPort.path,
    isOpen: lightPort.isOpen
  });
});

// Add this test endpoint
app.get("/light/test", (_, res) => {
  if (!isPortReady) {
    return res.status(500).json({ error: 'Arduino not connected' });
  }

  // Send test command
  lightPort.write('0\n', (err) => {
    if (err) {
      console.error('Test write failed:', err);
      res.status(500).json({ error: 'Write failed', details: err.message });
    } else {
      console.log('Test command sent');
      res.json({ status: 'Test command sent' });
    }
  });
});

// Add a debug route
app.get("/light/debug", (_, res) => {
  res.json({
    isPortReady,
    portPath: lightPort.path,
    isOpen: lightPort.isOpen,
    currentState: lightData,
    lastError: lastSerialError
  });
});

// 404 error handler
app.use((req, res) => res.status(404).send("404 - Page Not Found"));

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Serial port status:");
  console.log("Environmental:", environmentalPort ? "Connected" : "Not connected");
  console.log("Security:", securityPort ? "Connected" : "Not connected");
  console.log("Light:", lightPort ? "Connected" : "Not connected");
});

let lightData: LightData = {
  state: 0,
  buttonState: 0,
  intensity: 0
};

// Add near the top with other variable declarations
let lastSerialError: Error | null = null;
