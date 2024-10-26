import { Router } from 'express';
import { DataService } from '../services/DataService';
import { SerialPortManager } from '../utils/SerialPortManager';

export function createLightRoutes(dataService: DataService, serialManager: SerialPortManager) {
  const router = Router();

  // Add GET endpoint for light data
  router.get('/data', (req, res) => {
    try {
      const lightData = dataService.getLightData();
      res.json(lightData);
    } catch (error) {
      console.error('Error getting light data:', error);
      res.status(500).json({ error: 'Failed to get light data' });
    }
  });

  // Update the setState endpoint
  router.post('/setState', async (req, res) => {
    try {
      const { state } = req.body;
      if (typeof state !== 'number' || state < 0 || state > 2) {
        return res.status(400).json({ error: 'Invalid state value' });
      }

      await serialManager.write(`${state}\n`);
      const lightData = dataService.getLightData();
      res.json(lightData);
    } catch (error) {
      console.error('Error setting light state:', error);
      res.status(500).json({ error: 'Failed to set light state' });
    }
  });

  router.get("/status", (_, res) => {
    res.json(serialManager.getStatus());
  });

  return router;
}
