import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import { ToastProvider } from './lib/toast';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { ModulePage } from './pages/ModulePage';
import { StatusBadge } from './components/StatusBadge';
import type { Sermon, Event, Category, DonationCampaign, SpiritualResource, Hymn, RadioStation, LiveStream, MediaFile, User, TableColumn, FormField } from './lib/types';

function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <Topbar />
          <div style={{ marginLeft: '256px', marginTop: '64px', flex: 1, overflowY: 'auto', minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/sermons" element={<SermonsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/spiritual-library" element={<SpiritualResourcesPage />} />
              <Route path="/hymns" element={<HymnsPage />} />
              <Route path="/radio" element={<RadioStationsPage />} />
              <Route path="/live-stream" element={<LiveStreamsPage />} />
              <Route path="/media" element={<MediaFilesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}

const sermonColumns: TableColumn<Sermon>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'speaker', label: 'Speaker', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadgeWrapper status={value} />,
  },
  {
    key: 'views_count',
    label: 'Views',
    sortable: true,
    render: (value) => (value as number).toLocaleString(),
  },
  {
    key: 'created_at',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value as string).toLocaleDateString(),
  },
];

const sermonFields: FormField[] = [
  { name: 'title', label: 'Sermon Title', type: 'text', required: true },
  { name: 'speaker', label: 'Speaker Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'sermon_date', label: 'Sermon Date', type: 'date', required: true },
  { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
  { name: 'video_url', label: 'Video URL', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  { name: 'views_count', label: 'Views', type: 'number' },
];

function SermonsPage() {
  return (
    <ModulePage<Sermon>
      moduleName="sermons"
      moduleLabel="Sermons"
      columns={sermonColumns}
      formFields={sermonFields}
      searchableColumns={['title', 'speaker']}
      pageTitle="Sermons"
      itemName="Sermon"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        thumbnail_url: '',
        published_date: new Date().toISOString(),
        series: '',
        ...values,
      })}
    />
  );
}

const eventColumns: TableColumn<Event>[] = [
  { key: 'title', label: 'Title', sortable: true },
  {
    key: 'event_date',
    label: 'Date',
    sortable: true,
    render: (value) => new Date(value as string).toLocaleDateString(),
  },
  { key: 'location', label: 'Location', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadgeWrapper status={value} />,
  },
  {
    key: 'current_attendees',
    label: 'RSVPs',
    sortable: true,
    render: (value) => (value as number).toLocaleString(),
  },
];

const eventFields: FormField[] = [
  { name: 'title', label: 'Event Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'event_date', label: 'Event Date', type: 'date', required: true },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'max_attendees', label: 'Max Attendees', type: 'number' },
  { name: 'is_virtual', label: 'Virtual Event', type: 'checkbox' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'archived', label: 'Archived' },
    ],
  },
];

function EventsPage() {
  return (
    <ModulePage<Event>
      moduleName="events"
      moduleLabel="Events"
      columns={eventColumns}
      formFields={eventFields}
      searchableColumns={['title', 'location']}
      pageTitle="Events"
      itemName="Event"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        image_url: '',
        event_time: '00:00',
        end_time: '01:00',
        organizer: '',
        current_attendees: 0,
        virtual_link: '',
        ...values,
      })}
    />
  );
}

const categoryColumns: TableColumn<Category>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'slug', label: 'Slug', sortable: true },
  { key: 'order', label: 'Order', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const categoryFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'color', label: 'Color', type: 'color' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]},
];

function CategoriesPage() {
  return (
    <ModulePage<Category>
      moduleName="categories"
      moduleLabel="Categories"
      columns={categoryColumns}
      formFields={categoryFields}
      searchableColumns={['name']}
      pageTitle="Categories"
      itemName="Category"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...values,
      })}
    />
  );
}

const donationColumns: TableColumn<DonationCampaign>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'campaign_type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
  { key: 'donation_count', label: 'Donations', sortable: true },
  { key: 'goal_amount', label: 'Goal', sortable: true, render: (value) => `$${(value as number).toLocaleString()}` },
];

const donationFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'campaign_type', label: 'Type', type: 'text' },
  { name: 'goal_amount', label: 'Goal Amount', type: 'number', required: true },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'end_date', label: 'End Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]},
];

function DonationsPage() {
  return (
    <ModulePage<DonationCampaign>
      moduleName="donations"
      moduleLabel="Donation Campaigns"
      columns={donationColumns}
      formFields={donationFields}
      searchableColumns={['title']}
      pageTitle="Donation Campaigns"
      itemName="Campaign"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        image_url: '',
        current_amount: 0,
        donation_count: 0,
        ...values,
      })}
    />
  );
}

const spiritualColumns: TableColumn<SpiritualResource>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'resource_type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const spiritualFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'content', label: 'Content', type: 'textarea' },
  { name: 'author', label: 'Author', type: 'text' },
  { name: 'resource_type', label: 'Type', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]},
];

function SpiritualResourcesPage() {
  return (
    <ModulePage<SpiritualResource>
      moduleName="spiritualResources"
      moduleLabel="Spiritual Resources"
      columns={spiritualColumns}
      formFields={spiritualFields}
      searchableColumns={['title', 'author']}
      pageTitle="Spiritual Resources"
      itemName="Resource"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        category_id: '',
        published_date: new Date().toISOString(),
        view_count: 0,
        ...values,
      })}
    />
  );
}

const hymnColumns: TableColumn<Hymn>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'composer', label: 'Composer', sortable: true },
  { key: 'key', label: 'Key', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const hymnFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'composer', label: 'Composer', type: 'text', required: true },
  { name: 'hymn_number', label: 'Hymn Number', type: 'text' },
  { name: 'key', label: 'Key', type: 'text' },
  { name: 'tempo', label: 'Tempo', type: 'text' },
  { name: 'lyrics', label: 'Lyrics', type: 'textarea' },
  { name: 'audio_url', label: 'Audio URL', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]},
];

function HymnsPage() {
  return (
    <ModulePage<Hymn>
      moduleName="hymns"
      moduleLabel="Hymns"
      columns={hymnColumns}
      formFields={hymnFields}
      searchableColumns={['title', 'composer']}
      pageTitle="Hymns"
      itemName="Hymn"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        ...values,
      })}
    />
  );
}

const radioColumns: TableColumn<RadioStation>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'frequency', label: 'Frequency', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
  { key: 'listeners_count', label: 'Listeners', sortable: true },
];

const radioFields: FormField[] = [
  { name: 'name', label: 'Station Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'frequency', label: 'Frequency', type: 'text', required: true },
  { name: 'stream_url', label: 'Stream URL', type: 'text', required: true },
  { name: 'current_program', label: 'Current Program', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

function RadioStationsPage() {
  return (
    <ModulePage<RadioStation>
      moduleName="radioStations"
      moduleLabel="Radio Stations"
      columns={radioColumns}
      formFields={radioFields}
      searchableColumns={['name']}
      pageTitle="Radio Stations"
      itemName="Station"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.name || '').toLowerCase().replace(/\s+/g, '-'),
        is_live: false,
        listeners_count: 0,
        ...values,
      })}
    />
  );
}

const livestreamColumns: TableColumn<LiveStream>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'platform', label: 'Platform', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
  { key: 'viewers_count', label: 'Viewers', sortable: true },
];

const livestreamFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'stream_url', label: 'Stream URL', type: 'text', required: true },
  { name: 'platform', label: 'Platform', type: 'text' },
  { name: 'start_time', label: 'Start Time', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'live', label: 'Live' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'ended', label: 'Ended' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

function LiveStreamsPage() {
  return (
    <ModulePage<LiveStream>
      moduleName="liveStreams"
      moduleLabel="Live Streams"
      columns={livestreamColumns}
      formFields={livestreamFields}
      searchableColumns={['title']}
      pageTitle="Live Streams"
      itemName="Stream"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'),
        thumbnail_url: '',
        viewers_count: 0,
        ...values,
      })}
    />
  );
}

const mediaColumns: TableColumn<MediaFile>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'file_type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
  { key: 'uploaded_by', label: 'Uploaded By', sortable: true },
];

const mediaFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'file_name', label: 'File Name', type: 'text' },
  { name: 'file_type', label: 'File Type', type: 'select', options: [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Document' },
  ]},
  { name: 'url', label: 'URL', type: 'text', required: true },
  { name: 'uploaded_by', label: 'Uploaded By', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
  ]},
];

function MediaFilesPage() {
  return (
    <ModulePage<MediaFile>
      moduleName="mediaFiles"
      moduleLabel="Media Files"
      columns={mediaColumns}
      formFields={mediaFields}
      searchableColumns={['title']}
      pageTitle="Media Library"
      itemName="File"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        file_size: 0,
        mime_type: 'application/octet-stream',
        ...values,
      })}
    />
  );
}

const userColumns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const userFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'role', label: 'Role', type: 'select', options: [
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'viewer', label: 'Viewer' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ]},
];

function UsersPage() {
  return (
    <ModulePage<User>
      moduleName="users"
      moduleLabel="Users"
      columns={userColumns}
      formFields={userFields}
      searchableColumns={['name', 'email']}
      pageTitle="Users"
      itemName="User"
      createDefaultItem={(id, values) => ({
        id,
        church_id: 'default',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        ...values,
      })}
    />
  );
}

function StatusBadgeWrapper({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}

export default App;
