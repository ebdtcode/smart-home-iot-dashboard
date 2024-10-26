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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLightRoutes = createLightRoutes;
const express_1 = require("express");
function createLightRoutes(dataService, serialManager) {
    const router = (0, express_1.Router)();
    // Add GET endpoint for light data
    router.get('/data', (req, res) => {
        try {
            const lightData = dataService.getLightData();
            res.json(lightData);
        }
        catch (error) {
            console.error('Error getting light data:', error);
            res.status(500).json({ error: 'Failed to get light data' });
        }
    });
    // Update the setState endpoint
    router.post('/setState', (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { state } = req.body;
            if (typeof state !== 'number' || state < 0 || state > 2) {
                return res.status(400).json({ error: 'Invalid state value' });
            }
            yield serialManager.write(`${state}\n`);
            const lightData = dataService.getLightData();
            res.json(lightData);
        }
        catch (error) {
            console.error('Error setting light state:', error);
            res.status(500).json({ error: 'Failed to set light state' });
        }
    }));
    router.get("/status", (_, res) => {
        res.json(serialManager.getStatus());
    });
    return router;
}
