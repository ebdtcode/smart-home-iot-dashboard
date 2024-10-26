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
    router.get("/data/light", (_, res) => {
        try {
            const data = dataService.getLightData();
            console.log("Sending light data:", data);
            res.json(data);
        }
        catch (error) {
            console.error('Error getting light data:', error);
            res.status(500).json({ error: 'Failed to get light data' });
        }
    });
    router.post("/setState", (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { state } = req.body;
            console.log(`Received setState request for state: ${state}`);
            yield serialManager.write(`${state}\n`);
            console.log(`Sent state ${state} to Arduino`);
            // Wait briefly for Arduino to process
            yield new Promise(resolve => setTimeout(resolve, 100));
            const currentData = dataService.getLightData();
            console.log(`Responding with current data:`, currentData);
            res.json(currentData);
        }
        catch (error) {
            console.error('Error in setState:', error);
            res.status(500).json({ error: 'Failed to set state' });
        }
    }));
    router.get("/status", (_, res) => {
        res.json(serialManager.getStatus());
    });
    return router;
}
