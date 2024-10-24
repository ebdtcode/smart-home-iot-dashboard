import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { SerialPort, ReadlineParser } from "serialport";
import cors from "cors";

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

// Default data
let environmentalData: EnvironmentalData = {
  temperature: 22,
  humidity: 50,
  light: 300,
  sound: 30,
};

let securityData: SecurityData = {
  motion: 0,
  sound: 20,
  led: 0,
};

// Configure Serial Port for Environmental Monitor
const environmentalPort = new SerialPort({
  path: "/dev/tty.usbmodem21301", // Replace with your actual serial port path
  baudRate: 9600,
});

const environmentalParser = environmentalPort.pipe(new ReadlineParser({ delimiter: "\n" }));
environmentalParser.on("data", (data: string) => {
  try {
    const parsedData = JSON.parse(data);
    environmentalData = { ...environmentalData, ...parsedData };
    console.log("Environmental Data:", environmentalData);
  } catch (error) {
    console.error("Error parsing environmental data:", error);
  }
});

// Configure Serial Port for Home Security Monitor
const securityPort = new SerialPort({
  path: "/dev/tty.usbmodem214201", // Replace with your actual serial port path
  baudRate: 9600,
});

const securityParser = securityPort.pipe(new ReadlineParser({ delimiter: "\n" }));
securityParser.on("data", (data: string) => {
  try {
    const parsedData = JSON.parse(data);
    securityData = { ...securityData, ...parsedData };
    console.log("Security Data:", securityData);
  } catch (error) {
    console.error("Error parsing security data:", error);
  }
});

// Middleware for CORS and static files
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));

// Routes for HTML pages
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "../public/main.html")));
app.get("/home", (_, res) => res.sendFile(path.join(__dirname, "../public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path.join(__dirname, "../public/monitor.html")));

// API routes to fetch data
app.get("/data/environment", (_, res) => res.json(environmentalData));
app.get("/data/security", (_, res) => res.json(securityData));

// 404 error handler
app.use((req, res) => res.status(404).send("404 - Page Not Found"));

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
