export interface BaseData {
  timestamp: number;
  status: number;
}

export interface EnvironmentalData extends BaseData {
  temperature: number;
  humidity: number;
  light: number;
  sound: number;
}

export interface SecurityData extends BaseData {
  motion: number;
  sound: number;
  led: number;
}

export interface LightData extends BaseData {
  state: number;
  buttonState: number;
  intensity: number;
}

export interface SerialPortConfig {
  path?: string;
  baudRate?: number;
  deviceType?: string;
}

export interface SerialStatus {
  isConnected: boolean;
  portPath: string;
  isOpen: boolean;
  lastError?: string;
  deviceType: string;  // Add this line
  reconnectAttempts: number;
}

export interface SerialData {
  [key: string]: any;  // Generic object type to match your validation
}
