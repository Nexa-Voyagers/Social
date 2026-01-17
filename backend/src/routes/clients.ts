import { Router } from 'express';
import { body, param } from 'express-validator';
import * as clientController from '../controllers/clientController';

const router = Router();

// Get all clients
router.get('/', clientController.getAllClients);

// Get single client
router.get('/:id', param('id').isUUID(), clientController.getClient);

// Create client
router.post(
  '/',
  [
    body('name').notEmpty().trim(),
    body('email').optional().isEmail(),
    body('branding').optional().isObject()
  ],
  clientController.createClient
);

// Update client
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim(),
    body('email').optional().isEmail(),
    body('branding').optional().isObject()
  ],
  clientController.updateClient
);

// Delete client
router.delete('/:id', param('id').isUUID(), clientController.deleteClient);

export default router;
