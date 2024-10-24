"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const serialport_1 = require("serialport");
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
// Configure Serial Port for Environmental Monitor
const environmentalPort = new serialport_1.SerialPort({
    path: "/dev/tty.usbmodem21301", // Replace with your actual serial port path
    baudRate: 9600,
});
const environmentalParser = environmentalPort.pipe(new serialport_1.ReadlineParser({ delimiter: "\n" }));
environmentalParser.on("data", (data) => {
    try {
        const parsedData = JSON.parse(data);
        environmentalData = Object.assign(Object.assign({}, environmentalData), parsedData);
        console.log("Environmental Data:", environmentalData);
    }
    catch (error) {
        console.error("Error parsing environmental data:", error);
    }
});
// Configure Serial Port for Home Security Monitor
const securityPort = new serialport_1.SerialPort({
    path: "/dev/tty.usbmodem214201", // Replace with your actual serial port path
    baudRate: 9600,
});
const securityParser = securityPort.pipe(new serialport_1.ReadlineParser({ delimiter: "\n" }));
securityParser.on("data", (data) => {
    try {
        const parsedData = JSON.parse(data);
        securityData = Object.assign(Object.assign({}, securityData), parsedData);
        console.log("Security Data:", securityData);
    }
    catch (error) {
        console.error("Error parsing security data:", error);
    }
});
// Middleware for CORS and static files
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// Routes for HTML pages
app.get("/", (_, res) => res.sendFile(path_1.default.join(__dirname, "../public/main.html")));
app.get("/home", (_, res) => res.sendFile(path_1.default.join(__dirname, "../public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path_1.default.join(__dirname, "../public/monitor.html")));
// API routes to fetch data
app.get("/data/environment", (_, res) => res.json(environmentalData));
app.get("/data/security", (_, res) => res.json(securityData));
// 404 error handler
app.use((req, res) => res.status(404).send("404 - Page Not Found"));
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});
// Start the server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
