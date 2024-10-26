import { EnvironmentalData, SecurityData, LightData } from '../utils/types';
import { INITIAL_DATA } from '../utils/constants';

interface ServiceStatus {
  isConnected: boolean;
  lastUpdate: number;
  error?: string;
}

export class DataService {
  private environmentalData: EnvironmentalData;
  private securityData: SecurityData;
  private lightData: LightData;
  private lastErrors: Record<string, Error | null> = {
    environmental: null,
    security: null,
    light: null
  };

  constructor() {
    this.environmentalData = INITIAL_DATA.environmental;
    this.securityData = INITIAL_DATA.security;
    this.lightData = INITIAL_DATA.light;
  }

  // Environmental methods
  public updateEnvironmentalData(data: Partial<EnvironmentalData>): EnvironmentalData {
    try {
      this.environmentalData = {
        ...this.environmentalData,
        ...data,
        timestamp: Date.now(),
        status: 1
      };
      this.lastErrors.environmental = null;
      return this.environmentalData;
    } catch (error) {
      this.lastErrors.environmental = error as Error;
      throw error;
    }
  }

  public getEnvironmentalData(): EnvironmentalData {
    return this.environmentalData;
  }

  public getEnvironmentalStatus(): ServiceStatus {
    return {
      isConnected: this.environmentalData.status === 1,
      lastUpdate: this.environmentalData.timestamp,
      error: this.lastErrors.environmental?.message
    };
  }

  // Security methods
  public updateSecurityData(data: Partial<SecurityData>): SecurityData {
    try {
      this.securityData = {
        ...this.securityData,
        ...data,
        timestamp: Date.now(),
        status: 1
      };
      this.lastErrors.security = null;
      return this.securityData;
    } catch (error) {
      this.lastErrors.security = error as Error;
      throw error;
    }
  }

  public getSecurityData(): SecurityData {
    return {
      ...this.securityData,
      motion: this.securityData.motion || 0,
      led: this.securityData.led || 0,
      sound: this.securityData.sound || 0
    };
  }

  public getSecurityStatus(): ServiceStatus {
    return {
      isConnected: this.securityData.status === 1,
      lastUpdate: this.securityData.timestamp,
      error: this.lastErrors.security?.message
    };
  }

  // Light methods
  public updateLightData(data: Partial<LightData>): LightData {
    try {
      this.lightData = {
        ...this.lightData,
        ...data,
        timestamp: Date.now(),
        status: 1
      };
      this.lastErrors.light = null;
      return this.lightData;
    } catch (error) {
      this.lastErrors.light = error as Error;
      throw error;
    }
  }

  public getLightData(): LightData {
    return {
      state: this.lightData.state,
      buttonState: this.lightData.buttonState,
      intensity: this.lightData.intensity,
      timestamp: this.lightData.timestamp,
      status: this.lightData.status
    };
  }

  public getLightStatus(): ServiceStatus {
    return {
      isConnected: this.lightData.status === 1,
      lastUpdate: this.lightData.timestamp,
      error: this.lastErrors.light?.message
    };
  }

  public updateLightState(state: number): LightData {
    return this.updateLightData({ state });
  }

  // General status method
  public getAllStatus() {
    return {
      environmental: this.getEnvironmentalStatus(),
      security: this.getSecurityStatus(),
      light: this.getLightStatus()
    };
  }
}
