import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { StoreProvider, useStore } from './lib/store';
import { ToastProvider, useToast } from './lib/toast';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DataTable } from './components/DataTable';
import { EntityForm } from './components/EntityForm';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { ModulePage } from './pages/ModulePage';
import { StatusBadge } from './components/StatusBadge';
import type { Sermon, Category, DonationCampaign, DonationRecord, SpiritualResource, Hymn, MediaFile, TableColumn, FormField } from './lib/types';

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
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/spiritual-library" element={<SpiritualResourcesPage />} />
              <Route path="/hymns" element={<HymnsPage />} />
              <Route path="/media" element={<MediaFilesPage />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
    key: 'created_at',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value as string).toLocaleDateString(),
  },
];

const sermonFields: FormField[] = [
  { name: 'title', label: 'Sermon Title', type: 'text', required: true },
  { name: 'speaker', label: 'Speaker Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'richtext' },
  { name: 'sermon_date', label: 'Sermon Date', type: 'date', required: true },
  { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
  { name: 'video_url', label: 'Video URL', type: 'text' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    defaultValue: 'active',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
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

const categoryColumns: TableColumn<Category>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const categoryFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
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
  { name: 'description', label: 'Description', type: 'richtext' },
  { name: 'campaign_type', label: 'Type', type: 'select', options: [
    { value: 'general', label: 'General' },
    { value: 'building', label: 'Building Fund' },
    { value: 'missions', label: 'Missions' },
    { value: 'education', label: 'Education' },
    { value: 'charity', label: 'Charity' },
    { value: 'emergency', label: 'Emergency Relief' },
  ]},
  { name: 'goal_amount', label: 'Goal Amount', type: 'number', required: true },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'end_date', label: 'End Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

const donorRecordColumns: TableColumn<DonationRecord>[] = [
  { key: 'donor_name', label: 'Donor Name', sortable: true },
  { key: 'donor_email', label: 'Email', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, render: (value) => `$${(value as number).toLocaleString()}` },
  { key: 'campaign_title', label: 'Campaign', sortable: true },
  { key: 'payment_method', label: 'Payment Method', sortable: true, render: (value) => (value as string).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
  { key: 'status', label: 'Status', render: (value) => {
    const colors: Record<string, { bg: string; color: string }> = {
      completed: { bg: '#dcfce7', color: '#166534' },
      pending: { bg: '#fef9c3', color: '#854d0e' },
      failed: { bg: '#fee2e2', color: '#991b1b' },
      refunded: { bg: '#f3f4f6', color: '#4b5563' },
    };
    const style = colors[(value as string)] || colors.pending;
    return <span style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, backgroundColor: style.bg, color: style.color }}>{(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}</span>;
  }},
  { key: 'donated_at', label: 'Date', sortable: true, render: (value) => new Date(value as string).toLocaleDateString() },
];

const donorRecordFields: FormField[] = [
  { name: 'donor_name', label: 'Donor Name', type: 'text', required: true },
  { name: 'donor_email', label: 'Email', type: 'email', required: true },
  { name: 'donor_phone', label: 'Phone', type: 'text' },
  { name: 'amount', label: 'Amount ($)', type: 'number', required: true, min: 1 },
  { name: 'campaign_id', label: 'Campaign', type: 'select', required: true, options: [] },
  { name: 'payment_method', label: 'Payment Method', type: 'select', required: true, options: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
  ]},
  { name: 'donated_at', label: 'Donation Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'completed', options: [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const filterSelectStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '13px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#fff',
  color: '#374151',
  minWidth: '150px',
  fontFamily: 'inherit',
};

function DonationsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donors' | 'gateways'>('campaigns');
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const rawItems = state.donations as DonationCampaign[];
  const allDonorRecords = state.donationRecords as DonationRecord[];
  const items = rawItems.map(c => ({
    ...c,
    donation_count: allDonorRecords.filter(r => r.campaign_id === c.id).length,
  }));
  const editingItem = editingId ? items.find(s => s.id === editingId) : null;

  const initialValues = editingItem
    ? donationFields.reduce((acc, field) => {
        let val = (editingItem as any)[field.name] || field.defaultValue || '';
        if (field.type === 'date' && val) val = val.split('T')[0];
        acc[field.name] = val;
        return acc;
      }, {} as Record<string, any>)
    : donationFields.reduce((acc, field) => { acc[field.name] = field.defaultValue || ''; return acc; }, {} as Record<string, any>);

  const handleSubmit = (values: Record<string, any>) => {
    if (editingId) {
      dispatch({ type: 'UPDATE_ITEM', payload: { module: 'donations', id: editingId, updates: values } });
      toast.toast('Campaign updated successfully', 'success');
      setEditingId(null);
    } else {
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_ITEM', payload: { module: 'donations', item: {
        id, church_id: 'default', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        slug: (values.title || '').toLowerCase().replace(/\s+/g, '-'), image_url: '', current_amount: 0, donation_count: 0, ...values,
      }}});
      toast.toast('Campaign created successfully', 'success');
    }
    setShowForm(false);
  };

  const donorRecords = state.donationRecords as DonationRecord[];
  const campaigns = state.donations as DonationCampaign[];

  // Build campaign options dynamically for the donor form
  const donorFieldsWithCampaigns = donorRecordFields.map(f =>
    f.name === 'campaign_id'
      ? { ...f, options: campaigns.map(c => ({ value: c.id, label: c.title })) }
      : f
  );

  const [donorShowForm, setDonorShowForm] = useState(false);
  const [donorEditingId, setDonorEditingId] = useState<string | null>(null);

  // Donor filters
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const filteredDonorRecords = donorRecords.filter(r => {
    if (filterCampaign && r.campaign_id !== filterCampaign) return false;
    if (filterPaymentMethod && r.payment_method !== filterPaymentMethod) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterDateFrom && r.donated_at < new Date(filterDateFrom).toISOString()) return false;
    if (filterDateTo && r.donated_at > new Date(filterDateTo + 'T23:59:59').toISOString()) return false;
    return true;
  });

  const hasActiveFilters = filterCampaign || filterPaymentMethod || filterStatus || filterDateFrom || filterDateTo;
  const clearAllFilters = () => { setFilterCampaign(''); setFilterPaymentMethod(''); setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); };

  const donorEditingItem = donorEditingId ? donorRecords.find(d => d.id === donorEditingId) : null;
  const donorInitialValues = donorEditingItem
    ? donorFieldsWithCampaigns.reduce((acc, field) => {
        let val = (donorEditingItem as any)[field.name] || field.defaultValue || '';
        if (field.type === 'date' && val) val = val.split('T')[0];
        acc[field.name] = val;
        return acc;
      }, {} as Record<string, any>)
    : donorFieldsWithCampaigns.reduce((acc, field) => { acc[field.name] = field.defaultValue || ''; return acc; }, {} as Record<string, any>);

  const handleDonorSubmit = (values: Record<string, any>) => {
    const campaign = campaigns.find(c => c.id === values.campaign_id);
    const enriched = { ...values, campaign_title: campaign?.title || '' };
    if (donorEditingId) {
      dispatch({ type: 'UPDATE_ITEM', payload: { module: 'donationRecords', id: donorEditingId, updates: enriched } });
      toast.toast('Donation record updated', 'success');
      setDonorEditingId(null);
    } else {
      const id = crypto.randomUUID();
      dispatch({ type: 'ADD_ITEM', payload: { module: 'donationRecords', item: {
        id, church_id: 'default', created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        transaction_id: `txn_${crypto.randomUUID().slice(0, 12)}`,
        ...enriched,
      }}});
      toast.toast('Donation record created', 'success');
    }
    setDonorShowForm(false);
  };

  const tabs = [
    { key: 'campaigns' as const, label: 'Campaigns' },
    { key: 'donors' as const, label: 'Donor Records' },
    { key: 'gateways' as const, label: 'Payment Gateways' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setShowForm(false); setEditingId(null); setDonorShowForm(false); setDonorEditingId(null); }}
                style={{
                  padding: '12px 16px', fontSize: '14px', fontWeight: 500,
                  color: activeTab === tab.key ? '#1B73E8' : '#4b5563',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab.key ? '#1B73E8' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = '#111827'; }}
                onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = '#4b5563'; }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'campaigns' && (
          showForm ? (
            <EntityForm
              fields={donationFields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingId(null); }}
              submitLabel={editingId ? 'Update' : 'Create'}
              title={editingId ? 'Edit Campaign' : 'New Campaign'}
            />
          ) : (
            <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={() => { setEditingId(null); setShowForm(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', backgroundColor: '#1B73E8', color: '#fff',
                  borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
              >
                <Plus style={{ width: '20px', height: '20px' }} /> Add Campaign
              </button>
            </div>
            <DataTable
              columns={donationColumns}
              data={items}
              onEdit={(item) => { setEditingId(item.id); setShowForm(true); }}
              onDelete={(id) => { dispatch({ type: 'DELETE_ITEM', payload: { module: 'donations', id } }); toast.toast('Campaign deleted', 'success'); }}
              onDuplicate={(item) => { dispatch({ type: 'DUPLICATE_ITEM', payload: { module: 'donations', id: item.id } }); toast.toast('Campaign duplicated', 'success'); }}
              emptyState="No campaigns found. Create your first campaign!"
              searchableColumns={['title'] as (keyof DonationCampaign)[]}
            />
            </>
          )
        )}

        {activeTab === 'donors' && (
          donorShowForm ? (
            <EntityForm
              fields={donorFieldsWithCampaigns}
              initialValues={donorInitialValues}
              onSubmit={handleDonorSubmit}
              onCancel={() => { setDonorShowForm(false); setDonorEditingId(null); }}
              submitLabel={donorEditingId ? 'Update' : 'Create'}
              title={donorEditingId ? 'Edit Donation Record' : 'New Donation Record'}
            />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                  onClick={() => { setDonorEditingId(null); setDonorShowForm(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px', backgroundColor: '#1B73E8', color: '#fff',
                    borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
                >
                  <Plus style={{ width: '20px', height: '20px' }} /> Add Donation
                </button>
              </div>
              {/* Filter Bar */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
                marginBottom: '20px', padding: '16px', backgroundColor: '#fff',
                borderRadius: '8px', border: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Campaign</label>
                  <select
                    value={filterCampaign}
                    onChange={e => setFilterCampaign(e.target.value)}
                    style={filterSelectStyle}
                  >
                    <option value="">All Campaigns</option>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Payment Method</label>
                  <select
                    value={filterPaymentMethod}
                    onChange={e => setFilterPaymentMethod(e.target.value)}
                    style={filterSelectStyle}
                  >
                    <option value="">All Methods</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    style={filterSelectStyle}
                  >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>From Date</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                    style={filterSelectStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>To Date</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                    style={filterSelectStyle}
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      padding: '8px 14px', fontSize: '13px', fontWeight: 500, color: '#dc2626',
                      backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
                      cursor: 'pointer', transition: 'background-color 0.2s', alignSelf: 'flex-end',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <DataTable
                columns={donorRecordColumns}
                data={filteredDonorRecords}
                onEdit={(item) => { setDonorEditingId(item.id); setDonorShowForm(true); }}
                onDelete={(id) => { dispatch({ type: 'DELETE_ITEM', payload: { module: 'donationRecords', id } }); toast.toast('Donation record deleted', 'success'); }}
                emptyState={hasActiveFilters ? "No records match the selected filters." : "No donation records found."}
                searchableColumns={['donor_name', 'donor_email', 'campaign_title'] as (keyof DonationRecord)[]}
              />
            </>
          )
        )}

        {activeTab === 'gateways' && <PaymentGatewaysConfig />}
      </div>
    </div>
  );
}

function PaymentGatewaysConfig() {
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [stripeKeys, setStripeKeys] = useState({ publishableKey: '', secretKey: '', webhookSecret: '' });
  const [paypalKeys, setPaypalKeys] = useState({ clientId: '', clientSecret: '', mode: 'sandbox' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#1B73E8';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,115,232,0.1)';
  };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#d1d5db';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      {/* Stripe */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: stripeEnabled ? '1px solid #e5e7eb' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#635bff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.918 3.757 7.11c0 3.792 2.338 5.426 6.149 6.932 2.44.964 3.284 1.622 3.284 2.63 0 .936-.795 1.49-2.24 1.49-1.9 0-4.717-.932-6.591-2.108l-.89 5.613C5.22 22.756 7.776 24 11.52 24c2.594 0 4.715-.64 6.238-1.896 1.636-1.346 2.484-3.26 2.484-5.69 0-3.912-2.404-5.47-6.266-7.264z" fill="#fff"/></svg>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Stripe</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Accept credit cards, debit cards, and more</p>
            </div>
          </div>
          <button
            onClick={() => setStripeEnabled(!stripeEnabled)}
            style={{
              position: 'relative', display: 'inline-flex', height: '28px', width: '50px',
              alignItems: 'center', borderRadius: '9999px', transition: 'background-color 0.2s',
              backgroundColor: stripeEnabled ? '#1B73E8' : '#d1d5db',
              border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
            }}
          >
            <span style={{
              display: 'inline-block', height: '22px', width: '22px',
              transform: stripeEnabled ? 'translateX(24px)' : 'translateX(3px)',
              borderRadius: '50%', backgroundColor: '#fff', transition: 'transform 0.2s',
            }} />
          </button>
        </div>

        {stripeEnabled && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Publishable Key</label>
              <input
                type="text"
                placeholder="pk_live_..."
                value={stripeKeys.publishableKey}
                onChange={e => setStripeKeys(p => ({ ...p, publishableKey: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Secret Key</label>
              <input
                type="password"
                placeholder="sk_live_..."
                value={stripeKeys.secretKey}
                onChange={e => setStripeKeys(p => ({ ...p, secretKey: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Webhook Secret</label>
              <input
                type="password"
                placeholder="whsec_..."
                value={stripeKeys.webhookSecret}
                onChange={e => setStripeKeys(p => ({ ...p, webhookSecret: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Find your API keys in the Stripe Dashboard under Developers &rarr; API keys.</p>
          </div>
        )}
      </div>

      {/* PayPal */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: paypalEnabled ? '1px solid #e5e7eb' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#003087', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.127.964l-.004.025L7.076 21.337z" fill="#fff"/><path d="M18.318 7.083c-.037.21-.08.424-.131.644-1.19 6.108-5.253 8.217-10.446 8.217H5.607l-1.34 8.49a.526.526 0 0 0 .52.61h3.648c.467 0 .863-.34.936-.802l.039-.2.743-4.708.048-.26a.944.944 0 0 1 .936-.803h.59c3.816 0 6.802-1.55 7.677-6.032.366-1.872.176-3.433-.79-4.53a3.782 3.782 0 0 0-1.096-.826z" fill="#fff" opacity=".7"/></svg>
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>PayPal</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Accept PayPal payments and Pay Later options</p>
            </div>
          </div>
          <button
            onClick={() => setPaypalEnabled(!paypalEnabled)}
            style={{
              position: 'relative', display: 'inline-flex', height: '28px', width: '50px',
              alignItems: 'center', borderRadius: '9999px', transition: 'background-color 0.2s',
              backgroundColor: paypalEnabled ? '#1B73E8' : '#d1d5db',
              border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
            }}
          >
            <span style={{
              display: 'inline-block', height: '22px', width: '22px',
              transform: paypalEnabled ? 'translateX(24px)' : 'translateX(3px)',
              borderRadius: '50%', backgroundColor: '#fff', transition: 'transform 0.2s',
            }} />
          </button>
        </div>

        {paypalEnabled && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Client ID</label>
              <input
                type="text"
                placeholder="AW3d..."
                value={paypalKeys.clientId}
                onChange={e => setPaypalKeys(p => ({ ...p, clientId: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Client Secret</label>
              <input
                type="password"
                placeholder="EGnH..."
                value={paypalKeys.clientSecret}
                onChange={e => setPaypalKeys(p => ({ ...p, clientSecret: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Mode</label>
              <select
                value={paypalKeys.mode}
                onChange={e => setPaypalKeys(p => ({ ...p, mode: e.target.value }))}
                style={inputStyle}
                onFocus={focusHandler as any}
                onBlur={blurHandler as any}
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>Find your credentials in the PayPal Developer Dashboard under My Apps &amp; Credentials.</p>
          </div>
        )}
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '10px 24px', backgroundColor: '#1B73E8', color: '#fff',
            borderRadius: '8px', fontWeight: 500, fontSize: '14px', border: 'none',
            cursor: 'pointer', transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
        >
          {saved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

const spiritualColumns: TableColumn<SpiritualResource>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const spiritualFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'richtext' },
  { name: 'content', label: 'Content', type: 'richtext' },
  { name: 'author', label: 'Author', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
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
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
];

const hymnFields: FormField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'composer', label: 'Composer', type: 'text', required: true },
  { name: 'lyrics', label: 'Lyrics', type: 'richtext' },
  { name: 'image', label: 'Image', type: 'file', accept: 'image/*' },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
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

const mediaColumns: TableColumn<MediaFile>[] = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'file_type', label: 'Type', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadgeWrapper status={value} /> },
  { key: 'uploaded_by', label: 'Uploaded By', sortable: true },
];

const mediaFields: FormField[] = [
  { name: 'file_type', label: 'File Type', type: 'select', required: true, defaultValue: 'image', options: [
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Document' },
  ]},
  { name: 'file', label: 'Upload File', type: 'file', dependsOn: {
    field: 'file_type',
    acceptMap: {
      image: 'image/*',
      video: 'video/*',
      audio: 'audio/*',
      document: '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx',
    },
  }},
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'file_name', label: 'File Name', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
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
      createDefaultItem={(id, values) => {
        const file = values.file as File | undefined;
        const fileName = values.file_name || file?.name || '';
        const mimeType = values.file_type_type || file?.type || 'application/octet-stream';
        const fileSize = values.file_size || file?.size || 0;
        const fileType = values.file_type || (file ? detectFileType(file.type) : '');
        const url = values.url || (file ? URL.createObjectURL(file) : '');

        return {
          id,
          church_id: 'default',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          file_size: fileSize,
          mime_type: mimeType,
          ...values,
          file_name: fileName,
          file_type: fileType,
          url,
        };
      }}
    />
  );
}

function detectFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}


function StatusBadgeWrapper({ status }: { status: any }) {
  return <StatusBadge status={status} />;
}

export default App;
