"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityRoutes = createSecurityRoutes;
const express_1 = require("express");
function createSecurityRoutes(dataService) {
    const router = (0, express_1.Router)();
    router.get("/security", (_, res) => {
        try {
            const data = dataService.getSecurityData();
            console.log("Sending security data:", data);
            res.json(data);
        }
        catch (error) {
            console.error('Error getting security data:', error);
            res.status(500).json({ error: 'Failed to get security data' });
        }
    });
    router.get("/home/status", (_, res) => {
        try {
            const status = dataService.getSecurityStatus();
            res.json(status);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get security status' });
        }
    });
    return router;
}
