import { Router } from 'express';
const router = Router();

// Posts routes will be implemented
router.get('/', (req, res) => res.json({ message: 'Posts API' }));

export default router;
