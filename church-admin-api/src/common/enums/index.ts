// Permission Action
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
}

// Content Status
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

// User Role
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CHURCH_ADMIN = 'church_admin',
  EDITOR = 'editor',
  MEMBER = 'member',
  GUEST = 'guest',
}

// Media Type
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

// Donation Status
export enum DonationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Donation Type
export enum DonationType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  PLEDGE = 'pledge',
}

// Permission
export enum Permission {
  // User management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Content management
  CREATE_CONTENT = 'create_content',
  READ_CONTENT = 'read_content',
  UPDATE_CONTENT = 'update_content',
  DELETE_CONTENT = 'delete_content',
  PUBLISH_CONTENT = 'publish_content',

  // Media management
  UPLOAD_MEDIA = 'upload_media',
  READ_MEDIA = 'read_media',
  UPDATE_MEDIA = 'update_media',
  DELETE_MEDIA = 'delete_media',

  // Church settings
  MANAGE_CHURCH = 'manage_church',
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_PERMISSIONS = 'manage_permissions',

  // Donation management
  CREATE_DONATION = 'create_donation',
  READ_DONATION = 'read_donation',
  UPDATE_DONATION = 'update_donation',
  DELETE_DONATION = 'delete_donation',
  EXPORT_DONATIONS = 'export_donations',

  // Event management
  CREATE_EVENT = 'create_event',
  READ_EVENT = 'read_event',
  UPDATE_EVENT = 'update_event',
  DELETE_EVENT = 'delete_event',

  // Sermon management
  CREATE_SERMON = 'create_sermon',
  READ_SERMON = 'read_sermon',
  UPDATE_SERMON = 'update_sermon',
  DELETE_SERMON = 'delete_sermon',

  // Member management
  CREATE_MEMBER = 'create_member',
  READ_MEMBER = 'read_member',
  UPDATE_MEMBER = 'update_member',
  DELETE_MEMBER = 'delete_member',

  // Report management
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
  SCHEDULE_REPORTS = 'schedule_reports',

  // Audit
  VIEW_AUDIT = 'view_audit',
  EXPORT_AUDIT = 'export_audit',
}

// Event Status
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// Event Category
export enum EventCategory {
  WORSHIP = 'worship',
  STUDY = 'study',
  SOCIAL = 'social',
  OUTREACH = 'outreach',
  SPECIAL = 'special',
  MEETING = 'meeting',
  OTHER = 'other',
}

// Notification Type
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

// Notification Channel
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

// Audit Action
export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',
  PUBLISH = 'PUBLISH',
  UNPUBLISH = 'UNPUBLISH',
  ARCHIVE = 'ARCHIVE',
  UNARCHIVE = 'UNARCHIVE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  DOWNLOAD = 'DOWNLOAD',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

// Audit Entity Type
export enum AuditEntityType {
  USER = 'USER',
  CHURCH = 'CHURCH',
  CONTENT = 'CONTENT',
  MEDIA = 'MEDIA',
  DONATION = 'DONATION',
  EVENT = 'EVENT',
  SERMON = 'SERMON',
  MEMBER = 'MEMBER',
  SETTINGS = 'SETTINGS',
}

// Email Template Type
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  DONATION_RECEIPT = 'donation_receipt',
  DONATION_REMINDER = 'donation_reminder',
  EVENT_REMINDER = 'event_reminder',
  EVENT_CANCELLATION = 'event_cancellation',
  SERMON_PUBLISHED = 'sermon_published',
  USER_INVITATION = 'user_invitation',
  ACCOUNT_LOCKED = 'account_locked',
  PAYMENT_FAILED = 'payment_failed',
}

// Member Status
export enum MemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  VISITOR = 'visitor',
  PROSPECT = 'prospect',
  FORMER = 'former',
}

// Member Title
export enum MemberTitle {
  PASTOR = 'pastor',
  ELDER = 'elder',
  DEACON = 'deacon',
  DEACONESS = 'deaconess',
  MEMBER = 'member',
  VISITOR = 'visitor',
}

// Marital Status
export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
  SEPARATED = 'separated',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

// Report Type
export enum ReportType {
  MEMBERSHIP = 'membership',
  ATTENDANCE = 'attendance',
  GIVING = 'giving',
  EVENTS = 'events',
  SERMONS = 'sermons',
  CUSTOM = 'custom',
}

// Report Status
export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

// Report Format
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

// Sort Order
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Payment Method
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  CASH = 'cash',
  CHECK = 'check',
  OTHER = 'other',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Webhook Event Type
export enum WebhookEventType {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  DONATION_CREATED = 'donation.created',
  DONATION_UPDATED = 'donation.updated',
  DONATION_COMPLETED = 'donation.completed',
  DONATION_FAILED = 'donation.failed',
  EVENT_CREATED = 'event.created',
  EVENT_UPDATED = 'event.updated',
  EVENT_DELETED = 'event.deleted',
  EVENT_PUBLISHED = 'event.published',
  SERMON_CREATED = 'sermon.created',
  SERMON_UPDATED = 'sermon.updated',
  SERMON_DELETED = 'sermon.deleted',
  SERMON_PUBLISHED = 'sermon.published',
  CONTENT_CREATED = 'content.created',
  CONTENT_UPDATED = 'content.updated',
  CONTENT_DELETED = 'content.deleted',
  CONTENT_PUBLISHED = 'content.published',
}

// Webhook Status
export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
}

// Gender
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

// Communication Preference
export enum CommunicationPreference {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  NONE = 'none',
}

// Cache Key Prefix
export enum CacheKeyPrefix {
  USER = 'user:',
  CHURCH = 'church:',
  CONTENT = 'content:',
  MEDIA = 'media:',
  DONATION = 'donation:',
  EVENT = 'event:',
  SERMON = 'sermon:',
  MEMBER = 'member:',
  SETTINGS = 'settings:',
}
