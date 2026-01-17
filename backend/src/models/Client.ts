import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  HasMany,
  CreatedAt,
  UpdatedAt
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Asset from './Asset';
import ContentCalendar from './ContentCalendar';
import PlatformAccount from './PlatformAccount';

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermark?: boolean;
}

@Table({
  tableName: 'clients',
  timestamps: true
})
export default class Client extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  phone!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'URL to primary logo'
  })
  logoUrl!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: {
      primaryColor: '#000000',
      secondaryColor: '#FFFFFF'
    }
  })
  branding!: BrandingConfig;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Industry or business category'
  })
  industry!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Website URL'
  })
  website!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  active!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  // Associations
  @HasMany(() => Asset)
  assets!: Asset[];

  @HasMany(() => ContentCalendar)
  contentCalendars!: ContentCalendar[];

  @HasMany(() => PlatformAccount)
  platformAccounts!: PlatformAccount[];
}
