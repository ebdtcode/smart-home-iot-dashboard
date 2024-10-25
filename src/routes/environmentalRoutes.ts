import express from 'express';
import { DataService } from '../services/DataService';

export function createEnvironmentalRoutes(dataService: DataService) {
  const router = express.Router();

  // Change from /monitor/environment to /environment
  router.get('/environment', (req, res) => {
    try {
      const data = dataService.getEnvironmentalData();
      console.log('Sending environmental data:', data);
      res.json(data);
    } catch (error) {
      console.error('Error in /environment route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
