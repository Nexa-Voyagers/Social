import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Client from './Client';
import { Platform } from './Post';

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string;
}

export interface PlatformAccountData {
  accountId?: string;
  accountName?: string;
  accountUsername?: string;
  profilePictureUrl?: string;
  pageId?: string;
  pageName?: string;
  locationId?: string; // for GMB
  channelId?: string; // for YouTube
  additionalData?: any;
}

@Table({
  tableName: 'platform_accounts',
  timestamps: true
})
export default class PlatformAccount extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Client)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  clientId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(Platform)),
    allowNull: false
  })
  platform!: Platform;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Display name for the account'
  })
  accountName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Username or handle'
  })
  accountUsername!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Encrypted OAuth tokens'
  })
  tokens!: OAuthTokens;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Platform-specific account data'
  })
  accountData!: PlatformAccountData;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Last time tokens were refreshed'
  })
  lastTokenRefresh!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Last time account was verified/tested'
  })
  lastVerified!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Error message if account connection failed'
  })
  connectionError!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => Client)
  client!: Client;
}
