import express from 'express';
import path from 'path';
import cors from 'cors';
import { SerialPortManager } from './utils/SerialPortManager';
import { DataService } from './services/DataService';
import { createLightRoutes } from './routes/lightRoutes';
import { createEnvironmentalRoutes } from './routes/environmentalRoutes';
import { createSecurityRoutes } from './routes/securityRoutes';
import { getPortPath } from './utils/constants';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const dataService = new DataService();

// Initialize serial port managers
const lightPortManager = new SerialPortManager({
  path: getPortPath('light')
});

const environmentalPortManager = new SerialPortManager({
  path: getPortPath('environmental')
});

const securityPortManager = new SerialPortManager({
  path: getPortPath('security')
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/public')));
app.use('/js', express.static(path.join(__dirname, '../dist/public/js')));

// Routes
app.use('/light', createLightRoutes(dataService, lightPortManager));
app.use('/data', createEnvironmentalRoutes(dataService));
app.use('/data', createSecurityRoutes(dataService));  // Changed from '/home'

// HTML routes
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/index.html")));
app.get("/home", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/monitor.html")));
app.get("/light", (_, res) => res.sendFile(path.join(__dirname, "../dist/public/light.html")));

// Error handling
app.use((req, res) => res.status(404).send("404 - Page Not Found"));
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Serial port event handlers
lightPortManager.on('data', (parsedData) => {
  console.log('Received light data from Arduino:', parsedData);
  dataService.updateLightData(parsedData);
});

environmentalPortManager.on('data', (parsedData) => {
  console.log('Received environmental data from Arduino:', parsedData);
  dataService.updateEnvironmentalData(parsedData);
});

securityPortManager.on('data', (parsedData) => {
  console.log('Received security data from Arduino:', parsedData);
  dataService.updateSecurityData(parsedData);
});

// Handle errors for all port managers
[lightPortManager, environmentalPortManager, securityPortManager].forEach(manager => {
  manager.on('error', (error) => {
    console.error('Serial port error:', error);
  });

  manager.on('ready', (message) => {
    console.log('Arduino ready message:', message);
  });

  manager.on('raw', (data) => {
    console.log('Received raw data:', data);
  });
});

// Start server and connect to all ports
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  Promise.all([
    lightPortManager.connect(),
    environmentalPortManager.connect(),
    securityPortManager.connect()
  ]).catch(console.error);
});

// Export for testing
export { 
  app, 
  dataService, 
  lightPortManager, 
  environmentalPortManager, 
  securityPortManager 
};
