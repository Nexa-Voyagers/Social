import { Router } from 'express';
const router = Router();

// Content calendar routes will be implemented
router.get('/', (req, res) => res.json({ message: 'Content Calendar API' }));

export default router;
