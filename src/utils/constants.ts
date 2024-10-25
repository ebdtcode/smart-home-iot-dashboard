export const PORT_CONFIG = {
  BAUD_RATE: 9600,
  RECONNECT_INTERVAL: 5000,
  DEFAULT_TIMEOUT: 1000,
};

export const getPortPath = (deviceType: 'environmental' | 'security' | 'light'): string => {
  const base = process.platform === 'win32' 
    ? 'COM'
    : process.platform === 'darwin'
    ? '/dev/tty.usbmodem'
    : '/dev/ttyACM';

  switch (deviceType) {
    case 'environmental':
      return `${base}21301`;
    case 'security':
      return `${base}101`;
    case 'light':
      return `${base}21201`;
    default:
      return `${base}0`;
  }
};

export const ERROR_MESSAGES = {
  PORT_NOT_READY: 'Arduino not connected',
  INVALID_STATE: 'Invalid state',
  WRITE_FAILED: 'Failed to write to Arduino',
};

export const INITIAL_DATA = {
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
