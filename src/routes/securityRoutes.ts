import { Router } from 'express';
import { DataService } from '../services/DataService';

export function createSecurityRoutes(dataService: DataService) {
  const router = Router();

  router.get("/security", (_, res) => {
    try {
      const data = dataService.getSecurityData();
      console.log("Sending security data:", data);
      res.json(data);
    } catch (error) {
      console.error('Error getting security data:', error);
      res.status(500).json({ error: 'Failed to get security data' });
    }
  });

  router.get("/home/status", (_, res) => {
    try {
      const status = dataService.getSecurityStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get security status' });
    }
  });

  return router;
}
