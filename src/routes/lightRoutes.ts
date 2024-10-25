import { Router } from 'express';
import { DataService } from '../services/DataService';
import { SerialPortManager } from '../utils/SerialPortManager';

export function createLightRoutes(dataService: DataService, serialManager: SerialPortManager) {
  const router = Router();

  router.get("/data/light", (_, res) => {
    try {
      const data = dataService.getLightData();
      console.log("Sending light data:", data);
      res.json(data);
    } catch (error) {
      console.error('Error getting light data:', error);
      res.status(500).json({ error: 'Failed to get light data' });
    }
  });

  router.post("/setState", async (req, res) => {
    const { state } = req.body;
    console.log('Received state change request:', state);

    if (!serialManager.isReady()) {
      return res.status(500).json({ error: 'Arduino not connected' });
    }

    if (typeof state !== 'number' || state < 0 || state > 2) {
      return res.status(400).json({ error: 'Invalid state' });
    }

    try {
      await serialManager.write(`${state}\n`);
      const updatedData = dataService.updateLightState(state);
      res.json(updatedData);
    } catch (error) {
      console.error('Write error:', error);
      res.status(500).json({ error: 'Failed to write to Arduino' });
    }
  });

  router.get("/status", (_, res) => {
    res.json(serialManager.getStatus());
  });

  return router;
}
