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

export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  LOGO = 'logo',
  MUSIC = 'music',
  OTHER = 'other'
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number; // for videos/music in seconds
  format?: string;
  size?: number; // in bytes
  tags?: string[];
}

@Table({
  tableName: 'assets',
  timestamps: true
})
export default class Asset extends Model {
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
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.ENUM(...Object.values(AssetType)),
    allowNull: false,
    defaultValue: AssetType.IMAGE
  })
  type!: AssetType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'S3 or Cloudinary URL'
  })
  url!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Thumbnail URL for videos'
  })
  thumbnailUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'File path or S3 key'
  })
  filePath!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  mimeType!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  metadata!: AssetMetadata;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: []
  })
  tags!: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Mark as primary logo for the client'
  })
  isPrimary!: boolean;

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
