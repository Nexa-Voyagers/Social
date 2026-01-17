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
import ContentCalendar from './ContentCalendar';

export enum Platform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  GMB = 'gmb',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter'
}

export interface PlatformPostData {
  postId: string;
  postUrl?: string;
  platformSpecificData?: any;
}

export interface PostAnalytics {
  likes?: number;
  comments?: number;
  shares?: number;
  views?: number;
  impressions?: number;
  clicks?: number;
  engagement?: number;
  reach?: number;
  saves?: number;
  lastFetchedAt?: Date;
}

@Table({
  tableName: 'posts',
  timestamps: true
})
export default class Post extends Model {
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

  @ForeignKey(() => ContentCalendar)
  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  contentCalendarId!: string;

  @Column({
    type: DataType.ENUM(...Object.values(Platform)),
    allowNull: false
  })
  platform!: Platform;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Platform-specific post ID'
  })
  platformPostId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Direct URL to the post on the platform'
  })
  postUrl!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  caption!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'URL to the media (image/video) posted'
  })
  mediaUrl!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Platform-specific post data'
  })
  platformData!: PlatformPostData;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Engagement metrics from the platform'
  })
  analytics!: PostAnalytics;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'When the post was published'
  })
  publishedAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  isActive!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Error message if posting failed'
  })
  errorMessage!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => Client)
  client!: Client;

  @BelongsTo(() => ContentCalendar)
  contentCalendar!: ContentCalendar;
}
