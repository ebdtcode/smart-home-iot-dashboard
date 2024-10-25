"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Default data
let environmentalData = {
    temperature: 22,
    humidity: 50,
    light: 300,
    sound: 30,
};
let securityData = {
    motion: 0,
    sound: 20,
    led: 0,
};
let lightData = {
    state: 0,
    buttonState: 0,
    intensity: 0,
};
// Function to create a serial port connection with improved error handling
function createSerialConnection(portPath, baudRate, dataHandler) {
    try {
        console.log(`Attempting to connect to port: ${portPath}`);
        const port = new serialport_1.SerialPort({ path: portPath, baudRate: baudRate });
        console.log(`Successfully opened port: ${portPath}`);
        const parser = port.pipe(new parser_readline_1.ReadlineParser({ delimiter: "\n" }));
        port.on("error", (err) => {
            console.error(`Error on port ${portPath}:`, err.message);
        });
        parser.on("data", (data) => {
            console.log(`Raw data received from ${portPath}:`, data);
            try {
                const parsedData = JSON.parse(data.trim());
                console.log(`Parsed data from ${portPath}:`, parsedData);
                dataHandler(parsedData);
            }
            catch (error) {
                console.error(`Error parsing data from ${portPath}:`, error);
            }
        });
        return port;
    }
    catch (error) {
        console.error(`Failed to open port ${portPath}:`, error);
        return null;
    }
}
// Create connections for each device
const environmentalPort = createSerialConnection("/dev/tty.usbmodem21201", 9600, (data) => {
    environmentalData = { ...environmentalData, ...data };
    console.log("Environmental Data:", environmentalData);
});
const securityPort = createSerialConnection("/dev/tty.usbmodem214201", 9600, (data) => {
    securityData = { ...securityData, ...data };
    console.log("Security Data:", securityData);
});
const lightPort = createSerialConnection("/dev/tty.usbmodem214201", // Updated to the correct port
9600, (data) => {
    lightData = { ...lightData, ...data };
    console.log("Updated Light Data:", lightData);
});
// Middleware for CORS and static files
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist/public')));
app.use('/js', express_1.default.static(path_1.default.join(__dirname, '../dist/public/js')));
// Routes for HTML pages
app.get("/", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/index.html")));
app.get("/home", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/monitor.html")));
app.get("/light", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/light.html")));
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
// 404 error handler
app.use((req, res) => res.status(404).send("404 - Page Not Found"));
// Global error handler
app.use((err, req, res, next) => {
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
