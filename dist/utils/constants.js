"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_DATA = exports.ERROR_MESSAGES = exports.getPortPath = exports.PORT_CONFIG = void 0;
exports.PORT_CONFIG = {
    BAUD_RATE: 9600,
    RECONNECT_INTERVAL: 5000,
    DEFAULT_TIMEOUT: 1000,
};
const getPortPath = (deviceType) => {
    const deviceId = {
        environmental: '21301',
        security: '1101',
        light: '101'
    }[deviceType] || '0';
    switch (process.platform) {
        case 'win32':
            return `COM${deviceId}`;
        case 'darwin':
            return `/dev/tty.usbmodem${deviceId}`;
        case 'linux':
            return `/dev/ttyACM${deviceId}`;
        default:
            return `/dev/ttyACM${deviceId}`;
    }
};
exports.getPortPath = getPortPath;
exports.ERROR_MESSAGES = {
    PORT_NOT_READY: 'Arduino not connected',
    INVALID_STATE: 'Invalid state',
    WRITE_FAILED: 'Failed to write to Arduino',
};
exports.INITIAL_DATA = {
    environmental: {
        temperature: 0,
        humidity: 0,
        light: 0,
        sound: 0,
        timestamp: Date.now(),
        status: 0
    },
    security: {
        motion: 0,
        sound: 0,
        led: 0,
        timestamp: Date.now(),
        status: 0
    },
    light: {
        state: 0,
        buttonState: 0,
        intensity: 0,
        timestamp: Date.now(),
        status: 0
    }
};
