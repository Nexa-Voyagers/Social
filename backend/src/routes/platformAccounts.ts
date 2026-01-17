import { Router } from 'express';
const router = Router();

// Platform accounts routes will be implemented
router.get('/', (req, res) => res.json({ message: 'Platform Accounts API' }));

export default router;
