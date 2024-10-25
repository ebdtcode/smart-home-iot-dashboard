"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialPortManager = void 0;
const serialport_1 = require("serialport");
const parser_readline_1 = require("@serialport/parser-readline");
const events_1 = __importDefault(require("events"));
const constants_1 = require("./constants");
class SerialPortManager extends events_1.default {
    constructor(config = {}) {
        super();
        this.isConnected = false;
        this.lastError = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.deviceType = config.deviceType || 'unknown';
        const portConfig = {
            path: config.path || (0, constants_1.getPortPath)(this.deviceType),
            baudRate: config.baudRate || constants_1.PORT_CONFIG.BAUD_RATE
        };
        this.initializePort(portConfig);
    }
    initializePort(config) {
        try {
            this.port = new serialport_1.SerialPort({
                path: config.path,
                baudRate: config.baudRate,
                autoOpen: false
            });
            this.parser = this.port.pipe(new parser_readline_1.ReadlineParser({ delimiter: '\n' }));
            this.setupListeners();
            this.log('info', `Port initialized for ${this.deviceType}`);
        }
        catch (error) {
            this.handleError('Port initialization failed', error);
        }
    }
    setupListeners() {
        // Data handling
        this.parser.on('data', this.handleIncomingData.bind(this));
        // Port events
        this.port.on('error', this.handlePortError.bind(this));
        this.port.on('close', this.handlePortClose.bind(this));
        this.port.on('open', this.handlePortOpen.bind(this));
    }
    handleIncomingData(data) {
        try {
            const trimmedData = data.trim();
            // Handle initialization message
            if (this.isInitMessage(trimmedData)) {
                this.log('info', 'Arduino initialization received', trimmedData);
                this.emit('ready', trimmedData);
                return;
            }
            // Try parsing as JSON
            this.parseAndEmitData(trimmedData);
        }
        catch (error) {
            this.handleError('Data processing error', error);
        }
    }
    isInitMessage(data) {
        return data.includes('Arduino Ready') || data.includes('Initialized');
    }
    parseAndEmitData(data) {
        try {
            const parsed = JSON.parse(data);
            if (this.isValidSerialData(parsed)) {
                this.emit('data', parsed);
            }
            else {
                this.log('warn', 'Invalid data structure received', data);
                this.emit('raw', data);
            }
        }
        catch (jsonError) {
            this.log('info', 'Non-JSON data received', data);
            this.emit('raw', data);
        }
    }
    isValidSerialData(data) {
        return typeof data === 'object' && data !== null;
    }
    handlePortError(error) {
        this.isConnected = false;
        this.lastError = error;
        this.handleError('Port error', error);
        this.scheduleReconnect();
    }
    handlePortClose() {
        this.isConnected = false;
        this.log('info', 'Port closed');
        this.emit('disconnect');
        this.scheduleReconnect();
    }
    handlePortOpen() {
        this.isConnected = true;
        this.lastError = null;
        this.reconnectAttempts = 0;
        this.log('info', 'Port opened successfully');
        this.emit('connect');
    }
    handleError(context, error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.log('error', `${context}: ${errorMessage}`);
        this.emit('error', new Error(`${context}: ${errorMessage}`));
    }
    scheduleReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('error', 'Max reconnection attempts reached');
            return;
        }
        this.reconnectAttempts++;
        const delay = this.calculateReconnectDelay();
        this.reconnectTimer = setTimeout(() => {
            this.log('info', `Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect().catch(error => this.handleError('Reconnection failed', error));
        }, delay);
    }
    calculateReconnectDelay() {
        // Exponential backoff with maximum delay
        return Math.min(constants_1.PORT_CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1), 30000 // Maximum 30 seconds
        );
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const deviceInfo = `[${this.deviceType}]`;
        const logMessage = `${timestamp} ${deviceInfo} ${message}`;
        switch (level) {
            case 'info':
                console.log(logMessage, data ? data : '');
                break;
            case 'warn':
                console.warn(logMessage, data ? data : '');
                break;
            case 'error':
                console.error(logMessage, data ? data : '');
                break;
        }
    }
    // Public methods
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.port.isOpen) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                this.port.open((error) => {
                    if (error) {
                        this.lastError = error;
                        reject(error);
                    }
                    else {
                        this.isConnected = true;
                        resolve();
                    }
                });
            });
        });
    }
    write(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isReady()) {
                throw new Error('Port not connected');
            }
            return new Promise((resolve, reject) => {
                this.port.write(`${data}\n`, (error) => {
                    if (error) {
                        this.handleError('Write failed', error);
                        reject(error);
                    }
                    else {
                        this.log('info', 'Data written successfully', data);
                        resolve();
                    }
                });
            });
        });
    }
    isReady() {
        return this.isConnected && this.port.isOpen;
    }
    getStatus() {
        var _a;
        return {
            isConnected: this.isConnected,
            portPath: this.port.path,
            isOpen: this.port.isOpen,
            lastError: (_a = this.lastError) === null || _a === void 0 ? void 0 : _a.message,
            deviceType: this.deviceType,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cleanup();
            if (!this.port.isOpen) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                this.port.close((error) => {
                    if (error) {
                        this.handleError('Disconnect failed', error);
                        reject(error);
                    }
                    else {
                        this.isConnected = false;
                        this.log('info', 'Disconnected successfully');
                        resolve();
                    }
                });
            });
        });
    }
    cleanup() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        this.reconnectAttempts = 0;
    }
}
exports.SerialPortManager = SerialPortManager;
