// import { S3Client } from '@aws-sdk/client-s3';

// Placeholder type
class S3Client {
  constructor(config: any) {}
}

export interface StorageConfig {
  type: 'local' | 's3' | 'gcs';
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
  bucket: string;
  url?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  acl?: string;
  signatureVersion?: string;
}

export const s3Config = (): StorageConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    type: (process.env.STORAGE_TYPE as any) || 's3',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'church-admin-dev',
    url: process.env.AWS_S3_URL,
    endpoint: process.env.AWS_S3_ENDPOINT,
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
    acl: process.env.AWS_S3_ACL || 'private',
    signatureVersion: 'v4',
  };
};

export const createS3Client = (config: StorageConfig): S3Client => {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId || '',
      secretAccessKey: config.secretAccessKey || '',
    },
    ...(config.endpoint && {
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    }),
  });
};

// Storage paths configuration
export const storagePaths = {
  // Media uploads
  media: {
    images: 'media/images',
    videos: 'media/videos',
    audio: 'media/audio',
    documents: 'media/documents',
    thumbnails: 'media/thumbnails',
  },

  // User uploads
  users: {
    avatars: 'users/avatars',
    documents: 'users/documents',
  },

  // Church uploads
  church: {
    logo: 'church/logos',
    banner: 'church/banners',
    documents: 'church/documents',
  },

  // Event uploads
  events: {
    images: 'events/images',
    attachments: 'events/attachments',
  },

  // Sermon uploads
  sermons: {
    images: 'sermons/images',
    audio: 'sermons/audio',
    video: 'sermons/video',
  },

  // Reports and exports
  exports: {
    reports: 'exports/reports',
    backups: 'exports/backups',
    templates: 'exports/templates',
  },

  // Temporary files
  temp: {
    uploads: 'temp/uploads',
    processing: 'temp/processing',
  },
};

// File type configuration
export const fileTypeConfig = {
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  },
  video: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    maxSize: 500 * 1024 * 1024, // 500MB
    extensions: ['mp4', 'webm', 'ogv', 'mov', 'avi', 'mkv'],
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'],
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
  },
  document: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  },
};

// Image processing configuration
export const imageProcessingConfig = {
  quality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
  formats: ['webp', 'jpeg', 'png'],
  sizes: {
    thumbnail: { width: 200, height: 200 },
    small: { width: 400, height: 400 },
    medium: { width: 800, height: 600 },
    large: { width: 1920, height: 1080 },
    original: { width: null, height: null },
  },
  autoOrient: true,
  progressive: true,
  stripMetadata: process.env.STRIP_IMAGE_METADATA === 'true',
};

// Video processing configuration
export const videoProcessingConfig = {
  bitrate: process.env.VIDEO_BITRATE || '1000k',
  fps: parseInt(process.env.VIDEO_FPS || '30', 10),
  codec: process.env.VIDEO_CODEC || 'libx264',
  preset: process.env.VIDEO_PRESET || 'medium',
  generateThumbnail: process.env.GENERATE_VIDEO_THUMBNAIL !== 'false',
  thumbnailTime: process.env.VIDEO_THUMBNAIL_TIME || '00:00:02',
  maxDuration: parseInt(process.env.MAX_VIDEO_DURATION || '3600', 10), // 1 hour
};

// CDN configuration
export const cdnConfig = {
  enabled: process.env.CDN_ENABLED === 'true',
  provider: process.env.CDN_PROVIDER || 'cloudfront',
  baseUrl: process.env.CDN_BASE_URL,
  cacheControl: process.env.CDN_CACHE_CONTROL || 'max-age=31536000, public',
  invalidationPath: process.env.CDN_INVALIDATION_PATH || '/*',
};

// Cleanup configuration
export const cleanupConfig = {
  enableAutoCleanup: process.env.ENABLE_AUTO_CLEANUP === 'true',
  cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '86400000', 10), // 24 hours
  tempFileTTL: parseInt(process.env.TEMP_FILE_TTL || '604800000', 10), // 7 days
  orphanedFileTTL: parseInt(process.env.ORPHANED_FILE_TTL || '1209600000', 10), // 14 days
  dryRun: process.env.CLEANUP_DRY_RUN === 'true',
};
