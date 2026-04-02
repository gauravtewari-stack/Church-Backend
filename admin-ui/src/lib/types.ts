export type { ReactNode } from 'react';

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export interface BaseEntity {
  id: string;
  church_id: string;
  created_at: string;
  updated_at: string;
}

export interface Sermon extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  speaker: string;
  series: string;
  duration_minutes: number;
  video_url: string;
  thumbnail_url: string;
  status: ContentStatus;
  published_date: string;
  sermon_date: string;
  views_count: number;
}

export interface Event extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  event_date: string;
  event_time: string;
  end_time: string;
  location: string;
  organizer: string;
  max_attendees?: number;
  current_attendees: number;
  status: ContentStatus;
  image_url: string;
  is_virtual: boolean;
  virtual_link?: string;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  status: ContentStatus;
}

export interface DonationCampaign extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: ContentStatus;
  campaign_type: string;
  image_url: string;
  donation_count: number;
}

export interface SpiritualResource extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  content: string;
  category_id: string;
  author: string;
  resource_type: string;
  status: ContentStatus;
  published_date: string;
  view_count: number;
}

export interface Hymn extends BaseEntity {
  title: string;
  slug: string;
  lyrics: string;
  composer: string;
  hymn_number: string;
  key: string;
  tempo?: string;
  status: ContentStatus;
  audio_url?: string;
  midi_url?: string;
}

export interface RadioStation extends BaseEntity {
  name: string;
  slug: string;
  description: string;
  stream_url: string;
  status: "active" | "inactive";
  frequency: string;
  is_live: boolean;
  current_program: string;
  listeners_count: number;
}

export interface LiveStream extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  status: "live" | "scheduled" | "ended" | "inactive";
  start_time: string;
  end_time?: string;
  viewers_count: number;
  platform: string;
}

export interface MediaFile extends BaseEntity {
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  url: string;
  duration_seconds?: number;
  width?: number;
  height?: number;
  status: "active" | "archived";
  uploaded_by: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: "admin" | "moderator" | "editor" | "viewer";
  status: "active" | "inactive" | "suspended";
  last_login: string;
  avatar_url?: string;
  phone?: string;
}

export interface DashboardStats extends BaseEntity {
  total_sermons: number;
  total_events: number;
  total_donations: number;
  total_users: number;
  active_live_streams: number;
  active_radio_stations: number;
  total_media_files: number;
  website_visitors: number;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "richtext" | "select" | "checkbox" | "date" | "number" | "time" | "color" | "file";
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
  maxLength?: number;
  min?: number;
  max?: number;
  accept?: string;
  dependsOn?: { field: string; acceptMap?: Record<string, string> };
}

export interface StoreState {
  sermons: Sermon[];
  events: Event[];
  categories: Category[];
  donations: DonationCampaign[];
  spiritualResources: SpiritualResource[];
  hymns: Hymn[];
  radioStations: RadioStation[];
  liveStreams: LiveStream[];
  mediaFiles: MediaFile[];
  users: User[];
}

export interface StoreAction {
  type: "ADD_ITEM" | "UPDATE_ITEM" | "DELETE_ITEM" | "DUPLICATE_ITEM" | "BULK_ACTION" | "RESET";
  payload: any;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
