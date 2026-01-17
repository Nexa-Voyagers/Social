import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasOne,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Client from './Client';
import Post from './Post';

export enum ContentType {
  IMAGE_POST = 'image_post',
  VIDEO_POST = 'video_post',
  REEL = 'reel',
  STORY = 'story',
  CAROUSEL = 'carousel'
}

export enum PostStatus {
  SCHEDULED = 'scheduled',
  GENERATING = 'generating',
  READY = 'ready',
  POSTING = 'posting',
  POSTED = 'posted',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface VisualInstructions {
  style?: string; // e.g., "modern", "minimalist", "bold"
  layout?: string; // e.g., "centered", "split-screen"
  textPlacement?: string;
  imageStyle?: string; // e.g., "professional", "casual"
  useAssets?: string[]; // Asset IDs to use
  aiPrompt?: string; // For AI image generation
}

export interface PlatformConfig {
  facebook?: {
    enabled: boolean;
    pageId?: string;
    customCaption?: string;
  };
  instagram?: {
    enabled: boolean;
    accountId?: string;
    customCaption?: string;
    useStories?: boolean;
    useReels?: boolean;
  };
  linkedin?: {
    enabled: boolean;
    pageId?: string;
    customCaption?: string;
  };
  gmb?: {
    enabled: boolean;
    locationId?: string;
  };
  youtube?: {
    enabled: boolean;
    channelId?: string;
    asShorts?: boolean;
  };
}

@Table({
  tableName: 'content_calendar',
  timestamps: true
})
export default class ContentCalendar extends Model {
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
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    comment: 'Main caption/content for the post'
  })
  caption!: string;

  @Column({
    type: DataType.ENUM(...Object.values(ContentType)),
    allowNull: false
  })
  contentType!: ContentType;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'When to post this content'
  })
  scheduledAt!: Date;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: []
  })
  hashtags!: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {}
  })
  visualInstructions!: VisualInstructions;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    comment: 'Which platforms to post to and their configs'
  })
  platforms!: PlatformConfig;

  @Column({
    type: DataType.ENUM(...Object.values(PostStatus)),
    allowNull: false,
    defaultValue: PostStatus.SCHEDULED
  })
  status!: PostStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'URL to generated content (image/video)'
  })
  generatedContentUrl!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Error details if failed'
  })
  errorDetails!: any;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'AI-generated or refined caption'
  })
  finalCaption!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of retry attempts for failed posts'
  })
  retryCount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When content generation started'
  })
  generationStartedAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When content generation completed'
  })
  generationCompletedAt!: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Associations
  @BelongsTo(() => Client)
  client!: Client;

  @HasOne(() => Post)
  post!: Post;
}
