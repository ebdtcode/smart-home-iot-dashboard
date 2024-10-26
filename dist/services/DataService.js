"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const constants_1 = require("../utils/constants");
class DataService {
    constructor() {
        this.lastErrors = {
            environmental: null,
            security: null,
            light: null
        };
        this.environmentalData = constants_1.INITIAL_DATA.environmental;
        this.securityData = constants_1.INITIAL_DATA.security;
        this.lightData = constants_1.INITIAL_DATA.light;
    }
    // Environmental methods
    updateEnvironmentalData(data) {
        try {
            this.environmentalData = Object.assign(Object.assign(Object.assign({}, this.environmentalData), data), { timestamp: Date.now(), status: 1 });
            this.lastErrors.environmental = null;
            return this.environmentalData;
        }
        catch (error) {
            this.lastErrors.environmental = error;
            throw error;
        }
    }
    getEnvironmentalData() {
        return this.environmentalData;
    }
    getEnvironmentalStatus() {
        var _a;
        return {
            isConnected: this.environmentalData.status === 1,
            lastUpdate: this.environmentalData.timestamp,
            error: (_a = this.lastErrors.environmental) === null || _a === void 0 ? void 0 : _a.message
        };
    }
    // Security methods
    updateSecurityData(data) {
        try {
            this.securityData = Object.assign(Object.assign(Object.assign({}, this.securityData), data), { timestamp: Date.now(), status: 1 });
            this.lastErrors.security = null;
            return this.securityData;
        }
        catch (error) {
            this.lastErrors.security = error;
            throw error;
        }
    }
    getSecurityData() {
        return Object.assign(Object.assign({}, this.securityData), { motion: this.securityData.motion || 0, led: this.securityData.led || 0, sound: this.securityData.sound || 0 });
    }
    getSecurityStatus() {
        var _a;
        return {
            isConnected: this.securityData.status === 1,
            lastUpdate: this.securityData.timestamp,
            error: (_a = this.lastErrors.security) === null || _a === void 0 ? void 0 : _a.message
        };
    }
    // Light methods
    updateLightData(data) {
        try {
            this.lightData = Object.assign(Object.assign(Object.assign({}, this.lightData), data), { timestamp: Date.now(), status: 1 });
            this.lastErrors.light = null;
            return this.lightData;
        }
        catch (error) {
            this.lastErrors.light = error;
            throw error;
        }
    }
    getLightData() {
        return {
            state: this.lightData.state,
            buttonState: this.lightData.buttonState,
            intensity: this.lightData.intensity,
            timestamp: this.lightData.timestamp,
            status: this.lightData.status
        };
    }
    getLightStatus() {
        var _a;
        return {
            isConnected: this.lightData.status === 1,
            lastUpdate: this.lightData.timestamp,
            error: (_a = this.lastErrors.light) === null || _a === void 0 ? void 0 : _a.message
        };
    }
    updateLightState(state) {
        return this.updateLightData({ state });
    }
    // General status method
    getAllStatus() {
        return {
            environmental: this.getEnvironmentalStatus(),
            security: this.getSecurityStatus(),
            light: this.getLightStatus()
        };
    }
}
exports.DataService = DataService;
