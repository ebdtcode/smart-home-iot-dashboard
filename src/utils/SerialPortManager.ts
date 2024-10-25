import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import EventEmitter from 'events';
import { SerialPortConfig, SerialStatus, SerialData } from './types';
import { PORT_CONFIG, getPortPath } from './constants';

export class SerialPortManager extends EventEmitter {
  private port!: SerialPort;
  private parser!: ReadlineParser;
  private reconnectTimer?: NodeJS.Timeout;
  private isConnected: boolean = false;
  private lastError: Error | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private deviceType: string;

  constructor(config: Partial<SerialPortConfig> = {}) {
    super();
    this.deviceType = config.deviceType || 'unknown';
    
    const portConfig = {
      path: config.path || getPortPath(this.deviceType as any),
      baudRate: config.baudRate || PORT_CONFIG.BAUD_RATE
    };

    this.initializePort(portConfig);
  }

  private initializePort(config: { path: string; baudRate: number }): void {
    try {
      this.port = new SerialPort({
        path: config.path,
        baudRate: config.baudRate,
        autoOpen: false
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
      this.setupListeners();
      
      this.log('info', `Port initialized for ${this.deviceType}`);
    } catch (error) {
      this.handleError('Port initialization failed', error);
    }
  }

  private setupListeners(): void {
    // Data handling
    this.parser.on('data', this.handleIncomingData.bind(this));
    
    // Port events
    this.port.on('error', this.handlePortError.bind(this));
    this.port.on('close', this.handlePortClose.bind(this));
    this.port.on('open', this.handlePortOpen.bind(this));
  }

  private handleIncomingData(data: string): void {
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
    } catch (error) {
      this.handleError('Data processing error', error);
    }
  }

  private isInitMessage(data: string): boolean {
    return data.includes('Arduino Ready') || data.includes('Initialized');
  }

  private parseAndEmitData(data: string): void {
    try {
      const parsed = JSON.parse(data);
      if (this.isValidSerialData(parsed)) {
        this.emit('data', parsed);
      } else {
        this.log('warn', 'Invalid data structure received', data);
        this.emit('raw', data);
      }
    } catch (jsonError) {
      this.log('info', 'Non-JSON data received', data);
      this.emit('raw', data);
    }
  }

  private isValidSerialData(data: any): data is SerialData {
    return typeof data === 'object' && data !== null;
  }

  private handlePortError(error: Error): void {
    this.isConnected = false;
    this.lastError = error;
    this.handleError('Port error', error);
    this.scheduleReconnect();
  }

  private handlePortClose(): void {
    this.isConnected = false;
    this.log('info', 'Port closed');
    this.emit('disconnect');
    this.scheduleReconnect();
  }

  private handlePortOpen(): void {
    this.isConnected = true;
    this.lastError = null;
    this.reconnectAttempts = 0;
    this.log('info', 'Port opened successfully');
    this.emit('connect');
  }

  private handleError(context: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('error', `${context}: ${errorMessage}`);
    this.emit('error', new Error(`${context}: ${errorMessage}`));
  }

  private scheduleReconnect(): void {
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
      this.connect().catch(error => 
        this.handleError('Reconnection failed', error)
      );
    }, delay);
  }

  private calculateReconnectDelay(): number {
    // Exponential backoff with maximum delay
    return Math.min(
      PORT_CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Maximum 30 seconds
    );
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
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
  public async connect(): Promise<void> {
    if (this.port.isOpen) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.port.open((error) => {
        if (error) {
          this.lastError = error;
          reject(error);
        } else {
          this.isConnected = true;
          resolve();
        }
      });
    });
  }

  public async write(data: string): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Port not connected');
    }

    return new Promise((resolve, reject) => {
      this.port.write(`${data}\n`, (error) => {
        if (error) {
          this.handleError('Write failed', error);
          reject(error);
        } else {
          this.log('info', 'Data written successfully', data);
          resolve();
        }
      });
    });
  }

  public isReady(): boolean {
    return this.isConnected && this.port.isOpen;
  }

  public getStatus(): SerialStatus {
    return {
      isConnected: this.isConnected,
      portPath: this.port.path,
      isOpen: this.port.isOpen,
      lastError: this.lastError?.message,
      deviceType: this.deviceType,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  public async disconnect(): Promise<void> {
    this.cleanup();
    
    if (!this.port.isOpen) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.port.close((error) => {
        if (error) {
          this.handleError('Disconnect failed', error);
          reject(error);
        } else {
          this.isConnected = false;
          this.log('info', 'Disconnected successfully');
          resolve();
        }
      });
    });
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.reconnectAttempts = 0;
  }
}
