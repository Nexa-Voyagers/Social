import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Client from '../models/Client';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Get all clients
 */
export async function getAllClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await Client.findAll({
      include: ['assets', 'platformAccounts'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single client
 */
export async function getClient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: ['assets', 'contentCalendars', 'platformAccounts']
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new client
 */
export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const clientData = req.body;

    const client = await Client.create(clientData);

    logger.info(`Client created: ${client.id}`);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update client
 */
export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id } = req.params;
    const updates = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    await client.update(updates);

    logger.info(`Client updated: ${client.id}`);

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete client
 */
export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 400);
    }

    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    await client.destroy();

    logger.info(`Client deleted: ${id}`);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
