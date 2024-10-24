// path: '/dev/tty.usbmodem21301',  // Adjust to your port (e.g., COM3 on Windows)
import express, { Request, Response, NextFunction } from 'express';
import { SerialPort, ReadlineParser } from 'serialport';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000

// Add error handling for unhandled exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware to handle async errors properly
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Set CSP headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self';"
  );
  next();
});

// Serve static files from 'dist/public'
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html on the root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Store the latest sensor data
let latestData = { temperature: 0, humidity: 0, light: 0, sound: 0, timestamp: Date.now() };

// Configure serial port with error handling
const port = new SerialPort({
  path: '/dev/tty.usbmodem21301',  // Adjust based on your system's serial port path
  baudRate: 9600,
});

port.on('error', (err) => {
  console.error('Serial Port Error:', err);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

parser.on('data', (data: string) => {
  try {
    latestData = JSON.parse(data);
    latestData.timestamp = Date.now();
    console.log('Received data:', latestData);
  } catch (err) {
    console.error('Failed to parse data:', err);
  }
});

// Endpoint to return the latest sensor data
app.get('/data', (req: Request, res: Response) => {
  res.json(latestData);
});

// Start the server with error handling
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server Error:', err);
});
