import { Link } from 'react-router-dom';
import { Mic, Calendar, Heart, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Dashboard() {
  const { state } = useStore();

  const stats = [
    {
      label: 'Sermons',
      value: state.sermons.length,
      icon: Mic,
      bgColor: '#dbeafe',
      iconColor: '#1d4ed8',
    },
    {
      label: 'Events',
      value: state.events.length,
      icon: Calendar,
      bgColor: '#dffcf0',
      iconColor: '#059669',
    },
    {
      label: 'Donations',
      value: `$${state.donations.reduce((sum, d) => sum + d.current_amount, 0).toLocaleString()}`,
      icon: Heart,
      bgColor: '#fee2e2',
      iconColor: '#dc2626',
    },
    {
      label: 'Media Files',
      value: state.mediaFiles.length,
      icon: ImageIcon,
      bgColor: '#fef3c7',
      iconColor: '#f59e0b',
    },
  ];

  const latestSermons = state.sermons.slice(0, 3);
  const upcomingEvents = state.events.slice(0, 3);
  const activeCampaigns = state.donations.filter((d) => d.status === 'draft' || d.status === 'published').slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Dashboard</h1>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '4px' }}>{stat.label}</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stat.value}</p>
                  </div>
                  <div style={{ backgroundColor: stat.bgColor, padding: '12px', borderRadius: '8px' }}>
                    <Icon style={{ color: stat.iconColor, width: '24px', height: '24px' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Latest Sermons */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Latest Sermons</h2>
              <Link to="/sermons" style={{ color: '#1B73E8', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
            {latestSermons.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No sermons found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {latestSermons.map((sermon) => (
                  <div key={sermon.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{sermon.title}</p>
                    <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>By {sermon.speaker}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(sermon.sermon_date).toLocaleDateString()}</p>
                      <span
                        style={{
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          paddingTop: '4px',
                          paddingBottom: '4px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: sermon.status === 'published' ? '#dffcf0' : sermon.status === 'draft' ? '#f3f4f6' : '#dbeafe',
                          color: sermon.status === 'published' ? '#065f46' : sermon.status === 'draft' ? '#374151' : '#1e40af',
                        }}
                      >
                        {sermon.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Upcoming Events</h2>
              <Link to="/events" style={{ color: '#1B73E8', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No events found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingEvents.map((event) => (
                  <div key={event.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{event.title}</p>
                    <p style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{event.location}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(event.event_date).toLocaleDateString()}</p>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#1B73E8' }}>{event.current_attendees} RSVPs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donation Campaigns */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Active Campaigns</h2>
              <Link to="/donations" style={{ color: '#1B73E8', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
            {activeCampaigns.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No campaigns found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeCampaigns.map((campaign) => {
                  const percentage = (campaign.current_amount / campaign.goal_amount) * 100;
                  return (
                    <div key={campaign.id} style={{ paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                      <p style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{campaign.title}</p>
                      <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '8px', marginTop: '8px' }}>
                        <div style={{ backgroundColor: '#1B73E8', height: '8px', borderRadius: '9999px', width: `${Math.min(percentage, 100)}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#4b5563' }}>${campaign.current_amount.toLocaleString()}</p>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>${campaign.goal_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Add Sermon', href: '/sermons' },
              { label: 'Create Event', href: '/events' },
              { label: 'New Campaign', href: '/donations' },
              { label: 'Upload Media', href: '/media' },
              { label: 'Add Hymn', href: '/hymns' },
              { label: 'Go Live', href: '/live-stream' },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                style={{
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  backgroundColor: '#1B73E8',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1556c9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1B73E8')}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
