export const PORT_CONFIG = {
  BAUD_RATE: 9600,
  RECONNECT_INTERVAL: 5000,
  DEFAULT_TIMEOUT: 1000,
};

export const PORT_MAPPINGS = {
  environmental: {
    win32: 'COM4',
    darwin: '/dev/tty.usbmodem21301',
    linux: '/dev/ttyACM0'
  },
  security: {
    win32: 'COM5',
    darwin: '/dev/tty.usbmodem1101',
    linux: '/dev/ttyACM1'
  },
  light: {
    win32: 'COM6',
    darwin: '/dev/tty.usbmodem101',
    linux: '/dev/ttyACM2'
  }
};

export const getPortPath = (deviceType: 'environmental' | 'security' | 'light'): string => {
  const platform = process.platform as 'win32' | 'darwin' | 'linux';
  return PORT_MAPPINGS[deviceType][platform] || PORT_MAPPINGS[deviceType]['linux'];
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
