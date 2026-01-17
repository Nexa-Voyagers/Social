import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import logger from '../utils/logger';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'autoupload',
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'autoupload',
  password: process.env.DB_PASSWORD || 'autoupload',
  models: [path.join(__dirname, '../models')],
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

export async function initDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();

    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

export default sequelize;
