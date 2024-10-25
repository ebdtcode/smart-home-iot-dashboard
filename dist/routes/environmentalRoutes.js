"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnvironmentalRoutes = createEnvironmentalRoutes;
const express_1 = __importDefault(require("express"));
function createEnvironmentalRoutes(dataService) {
    const router = express_1.default.Router();
    // Change from /monitor/environment to /environment
    router.get('/environment', (req, res) => {
        try {
            const data = dataService.getEnvironmentalData();
            console.log('Sending environmental data:', data);
            res.json(data);
        }
        catch (error) {
            console.error('Error in /environment route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return router;
}
