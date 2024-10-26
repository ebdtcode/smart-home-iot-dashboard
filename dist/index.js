"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityPortManager = exports.environmentalPortManager = exports.lightPortManager = exports.dataService = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const SerialPortManager_1 = require("./utils/SerialPortManager");
const DataService_1 = require("./services/DataService");
const lightRoutes_1 = require("./routes/lightRoutes");
const environmentalRoutes_1 = require("./routes/environmentalRoutes");
const securityRoutes_1 = require("./routes/securityRoutes");
const constants_1 = require("./utils/constants");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
// Initialize services
const dataService = new DataService_1.DataService();
exports.dataService = dataService;
// Initialize serial port managers
const lightPortManager = new SerialPortManager_1.SerialPortManager({
    path: (0, constants_1.getPortPath)('light')
});
exports.lightPortManager = lightPortManager;
const environmentalPortManager = new SerialPortManager_1.SerialPortManager({
    path: (0, constants_1.getPortPath)('environmental')
});
exports.environmentalPortManager = environmentalPortManager;
const securityPortManager = new SerialPortManager_1.SerialPortManager({
    path: (0, constants_1.getPortPath)('security')
});
exports.securityPortManager = securityPortManager;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist/public')));
app.use('/js', express_1.default.static(path_1.default.join(__dirname, '../dist/public/js')));
// Routes
app.use('/data/light', (0, lightRoutes_1.createLightRoutes)(dataService, lightPortManager));
app.use('/data', (0, environmentalRoutes_1.createEnvironmentalRoutes)(dataService));
app.use('/data', (0, securityRoutes_1.createSecurityRoutes)(dataService)); // Changed from '/home'
// HTML routes
app.get("/", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/index.html")));
app.get("/home", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/home.html")));
app.get("/monitor", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/monitor.html")));
app.get("/light", (_, res) => res.sendFile(path_1.default.join(__dirname, "../dist/public/light.html")));
// Error handling
app.use((req, res) => res.status(404).send("404 - Page Not Found"));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});
// Serial port event handlers
lightPortManager.on('data', (parsedData) => {
    console.log('Received light data from Arduino:', parsedData);
    // Add validation before updating
    if (typeof parsedData.state === 'number' &&
        parsedData.state >= 0 &&
        parsedData.state <= 2) {
        dataService.updateLightData(parsedData);
    }
    else {
        console.warn('Invalid light state received:', parsedData);
    }
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
