import { Router } from 'express';
const router = Router();

// Asset routes will be implemented
router.get('/', (req, res) => res.json({ message: 'Assets API' }));

export default router;
