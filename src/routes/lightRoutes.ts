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
    try {
      const { state } = req.body;
      console.log(`Received setState request for state: ${state}`);
      
      await serialManager.write(`${state}\n`);
      console.log(`Sent state ${state} to Arduino`);
      
      // Wait briefly for Arduino to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentData = dataService.getLightData();
      console.log(`Responding with current data:`, currentData);
      res.json(currentData);
    } catch (error) {
      console.error('Error in setState:', error);
      res.status(500).json({ error: 'Failed to set state' });
    }
  });

  router.get("/status", (_, res) => {
    res.json(serialManager.getStatus());
  });

  return router;
}
