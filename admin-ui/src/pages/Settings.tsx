import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from '../lib/toast';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { DeleteModal } from '../components/DeleteModal';

type Tab = 'language' | 'cms';

interface LanguageKey {
  key: string;
  value: string;
}

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'active' | 'inactive';
}

export default function Settings() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('language');

  // Language Settings state
  const [langSearch, setLangSearch] = useState('');
  const [langKeys, setLangKeys] = useState<LanguageKey[]>([
    { key: 'About Church', value: 'About Church' },
    { key: 'Accepts cash & online payments', value: 'Accepts cash & online payments' },
    { key: 'Add to Calendar', value: 'Add to Calendar' },
    { key: 'All Events', value: 'All Events' },
    { key: 'All Sermons', value: 'All Sermons' },
    { key: 'Audio', value: 'Audio' },
    { key: 'Book Now', value: 'Book Now' },
    { key: 'Cancel', value: 'Cancel' },
    { key: 'Categories', value: 'Categories' },
    { key: 'Contact Us', value: 'Contact Us' },
    { key: 'Donate Now', value: 'Donate Now' },
    { key: 'Donation Amount', value: 'Donation Amount' },
    { key: 'Email Address', value: 'Email Address' },
    { key: 'Event Details', value: 'Event Details' },
    { key: 'Explore', value: 'Explore' },
    { key: 'Get Directions', value: 'Get Directions' },
    { key: 'Give', value: 'Give' },
    { key: 'Home', value: 'Home' },
    { key: 'Hymn Book', value: 'Hymn Book' },
    { key: 'Join Live', value: 'Join Live' },
    { key: 'Listen Now', value: 'Listen Now' },
    { key: 'Live Stream', value: 'Live Stream' },
    { key: 'Location', value: 'Location' },
    { key: 'More', value: 'More' },
    { key: 'No Results Found', value: 'No Results Found' },
    { key: 'Notifications', value: 'Notifications' },
    { key: 'Phone Number', value: 'Phone Number' },
    { key: 'Prayer Request', value: 'Prayer Request' },
    { key: 'Profile', value: 'Profile' },
    { key: 'Radio', value: 'Radio' },
    { key: 'Read More', value: 'Read More' },
    { key: 'Register', value: 'Register' },
    { key: 'RSVP', value: 'RSVP' },
    { key: 'Search', value: 'Search' },
    { key: 'Sermons', value: 'Sermons' },
    { key: 'Settings', value: 'Settings' },
    { key: 'Share', value: 'Share' },
    { key: 'Sign In', value: 'Sign In' },
    { key: 'Sign Out', value: 'Sign Out' },
    { key: 'Submit', value: 'Submit' },
    { key: 'Upcoming Events', value: 'Upcoming Events' },
    { key: 'Video', value: 'Video' },
    { key: 'View All', value: 'View All' },
    { key: 'Welcome', value: 'Welcome' },
    { key: 'Your Message', value: 'Your Message' },
  ]);

  // CMS Page state
  const [cmsPages, setCmsPages] = useState<CmsPage[]>([
    { id: '1', title: 'About Us', slug: 'about-us', content: '<p>Welcome to our church community.</p>', status: 'active' },
    { id: '2', title: 'Privacy Policy', slug: 'privacy-policy', content: '<p>Your privacy is important to us.</p>', status: 'active' },
  ]);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);

  const handleLangKeyChange = (index: number, value: string) => {
    setLangKeys(prev => prev.map((item, i) => i === index ? { ...item, value } : item));
  };

  const handleSaveLangKeys = () => {
    toast.toast('Language keys saved successfully', 'success');
  };

  const filteredLangKeys = langKeys.filter(item =>
    item.key.toLowerCase().includes(langSearch.toLowerCase()) ||
    item.value.toLowerCase().includes(langSearch.toLowerCase())
  );

  const handleSavePage = (page: CmsPage) => {
    if (editingPage) {
      setCmsPages(prev => prev.map(p => p.id === page.id ? page : p));
      toast.toast('Page updated successfully', 'success');
    } else {
      setCmsPages(prev => [...prev, { ...page, id: String(Date.now()) }]);
      toast.toast('Page created successfully', 'success');
    }
    setEditingPage(null);
    setShowPageForm(false);
  };

  const handleDeletePage = (id: string) => {
    setCmsPages(prev => prev.filter(p => p.id !== id));
    toast.toast('Page deleted', 'success');
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'language', label: 'Language Settings' },
    { key: 'cms', label: 'CMS Pages' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Settings</h1>

        {/* Tab navigation */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderBottom: activeTab === tab.key ? '2px solid #1B73E8' : '2px solid transparent',
                  color: activeTab === tab.key ? '#1B73E8' : '#4b5563',
                  fontWeight: 500,
                  fontSize: '14px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottomWidth: '2px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: activeTab === tab.key ? '#1B73E8' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) e.currentTarget.style.color = '#4b5563';
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language Settings Tab */}
        {activeTab === 'language' && (
          <div>
            {/* Search + Save row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <input
                  type="text"
                  placeholder="Search language key"
                  value={langSearch}
                  onChange={e => setLangSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                />
                <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <button
                onClick={handleSaveLangKeys}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#1B73E8',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
              >
                Save
              </button>
            </div>

            {/* Language key grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filteredLangKeys.map((item) => {
                const realIndex = langKeys.findIndex(k => k.key === item.key);
                return (
                  <input
                    key={item.key}
                    type="text"
                    value={item.value}
                    onChange={e => handleLangKeyChange(realIndex, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      color: '#111827',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#1B73E8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,115,232,0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                );
              })}
            </div>

            {filteredLangKeys.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>
                No language keys match your search.
              </div>
            )}
          </div>
        )}

        {/* CMS Pages Tab */}
        {activeTab === 'cms' && (
          <div>
            {showPageForm ? (
              <CmsPageForm
                page={editingPage}
                onSave={handleSavePage}
                onCancel={() => { setShowPageForm(false); setEditingPage(null); }}
              />
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>CMS Pages</h2>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Manage static pages for your church website.</p>
                  </div>
                  <button
                    onClick={() => { setEditingPage(null); setShowPageForm(true); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', backgroundColor: '#1B73E8', color: '#fff',
                      borderRadius: '8px', border: 'none', fontWeight: 500, fontSize: '14px',
                      cursor: 'pointer', transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
                  >
                    <Plus size={16} /> Add Page
                  </button>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {cmsPages.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                      <p style={{ fontSize: '14px' }}>No pages yet. Create your first CMS page.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb' }}>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                          <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cmsPages.map(page => (
                          <tr key={page.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '14px 24px', fontSize: '14px', color: '#111827', fontWeight: 500 }}>{page.title}</td>
                            <td style={{ padding: '14px 24px' }}>
                              <span style={{
                                padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500,
                                backgroundColor: page.status === 'active' ? '#dcfce7' : '#f3f4f6',
                                color: page.status === 'active' ? '#166534' : '#4b5563',
                              }}>
                                {page.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => { setEditingPage(page); setShowPageForm(true); }}
                                  style={{
                                    padding: '6px 12px', fontSize: '13px', color: '#1B73E8', backgroundColor: '#eff6ff',
                                    border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                  }}
                                >
                                  <Pencil size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => setDeletePageId(page.id)}
                                  style={{
                                    padding: '6px', color: '#ef4444', backgroundColor: 'transparent',
                                    border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        <DeleteModal
          isOpen={deletePageId !== null}
          title="Delete Page"
          message="Are you sure you want to delete this page? This action cannot be undone."
          onConfirm={() => {
            if (deletePageId) {
              handleDeletePage(deletePageId);
              setDeletePageId(null);
            }
          }}
          onCancel={() => setDeletePageId(null)}
        />
      </div>
    </div>
  );
}

function CmsPageForm({ page, onSave, onCancel }: {
  page: CmsPage | null;
  onSave: (page: CmsPage) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(page?.title || '');
  const [content, setContent] = useState(page?.content || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(page?.status || 'active');

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    onSave({ id: page?.id || '', title, slug: page?.slug || autoSlug, content, status });
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
        {page ? 'Edit Page' : 'New Page'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
            Title<span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            required
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#1B73E8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
            Content
          </label>
          <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote', 'link', 'image'],
                  [{ align: [] }],
                  ['clean'],
                ],
              }}
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
            style={inputStyle}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px',
              color: '#374151', fontWeight: 500, backgroundColor: 'transparent', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '8px 16px', backgroundColor: '#1B73E8', color: '#fff',
              borderRadius: '8px', fontWeight: 500, border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1556c9')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1B73E8')}
          >
            {page ? 'Update Page' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  );
}
