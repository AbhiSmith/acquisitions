import express from 'express';
import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/sign-up', signup);

router.post('/sign-in', (req, res) => {
  // Handle user sign-in logic here
  res.send('User signed in successfully');
});

router.post('/sign-out', (req, res) => {
  // Handle user sign-out logic here
  res.send('POST /api/auth/sign-out User signed out successfully');
});

export default router;