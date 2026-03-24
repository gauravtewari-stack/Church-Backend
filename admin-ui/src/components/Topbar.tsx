import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';

const pathLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/sermons': 'Sermons',
  '/events': 'Events',
  '/categories': 'Categories',
  '/donations': 'Donation Campaigns',
  '/spiritual-library': 'Spiritual Resources',
  '/hymns': 'Hymns',
  '/radio': 'Radio Stations',
  '/live-stream': 'Live Streams',
  '/media': 'Media Library',
  '/users': 'Users',
  '/settings': 'Settings',
};

export function Topbar() {
  const location = useLocation();

  const getPageTitle = () => {
    for (const [path, label] of Object.entries(pathLabels)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return label;
      }
    }
    return 'Dashboard';
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: '256px',
        height: '64px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        paddingLeft: '24px',
        paddingRight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
      }}
      className="lg:left-64"
    >
      {/* Left Side - Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'none',
            transition: 'background-color 0.2s ease',
          }}
          className="lg:hidden"
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Menu size={20} style={{ color: '#4b5563' }} />
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>{getPageTitle()}</h1>
      </div>

      {/* Right Side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          style={{
            position: 'relative',
            padding: '8px',
            color: '#4b5563',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px', borderLeft: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Grace A.</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Admin</p>
          </div>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(to bottom right, #3b82f6, #1e3a8a)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            GA
          </div>
        </div>
      </div>
    </header>
  );
}
