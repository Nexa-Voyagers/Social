import { Router } from 'express';
import clientRoutes from './clients';
import assetRoutes from './assets';
import contentCalendarRoutes from './contentCalendar';
import postRoutes from './posts';
import platformAccountRoutes from './platformAccounts';
import authRoutes from './auth';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/assets', assetRoutes);
router.use('/content-calendar', contentCalendarRoutes);
router.use('/posts', postRoutes);
router.use('/platform-accounts', platformAccountRoutes);

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'AutoUpload API',
    version: '1.0.0',
    description: 'Smart social media automation platform',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      assets: '/api/assets',
      contentCalendar: '/api/content-calendar',
      posts: '/api/posts',
      platformAccounts: '/api/platform-accounts'
    }
  });
});

export default router;
