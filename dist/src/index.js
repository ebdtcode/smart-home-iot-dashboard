"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// path: '/dev/tty.usbmodem21301',  // Adjust to your port (e.g., COM3 on Windows)
const express_1 = __importDefault(require("express"));
const serialport_1 = require("serialport");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
// Add error handling for unhandled exceptions and rejections
process.on('uncaughtException', (err) => {
    console.error('Unhandled Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Middleware to handle async errors properly
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Set CSP headers
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self';");
    next();
});
// Serve static files from 'dist/public'
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Store the latest sensor data
let latestData = { temperature: 0, humidity: 0, light: 0, sound: 0, timestamp: Date.now() };
// Configure serial port with error handling
const port = new serialport_1.SerialPort({
    path: '/dev/tty.usbmodem21301', // Adjust based on your system's serial port path
    baudRate: 9600,
});
port.on('error', (err) => {
    console.error('Serial Port Error:', err);
});
const parser = port.pipe(new serialport_1.ReadlineParser({ delimiter: '\n' }));
parser.on('data', (data) => {
    try {
        latestData = JSON.parse(data);
        latestData.timestamp = Date.now();
        console.log('Received data:', latestData);
    }
    catch (err) {
        console.error('Failed to parse data:', err);
    }
});
// Endpoint to return the latest sensor data
app.get('/data', (req, res) => {
    res.json(latestData);
});
// Start the server with error handling
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server Error:', err);
});
