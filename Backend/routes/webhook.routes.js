import express from 'express';
import { handleWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Route to receive GitHub webhooks or CI/CD results
router.post('/', express.json({ type: 'application/json' }), handleWebhook);

export default router;
