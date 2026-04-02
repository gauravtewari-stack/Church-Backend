import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  Folder,
  Gift,
  BookMarked,
  Music,
  Package,
  LayoutDashboard,
  Settings,
  Cross,
} from 'lucide-react';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  label: string;
  icon: React.ComponentType<{ size: number; style: React.CSSProperties }>;
  href: string;
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Content',
    items: [
      { label: 'Categories', icon: Folder, href: '/categories' },
      { label: 'Sermons', icon: BookOpen, href: '/sermons' },
      { label: 'Spiritual Library', icon: BookMarked, href: '/spiritual-library' },
      { label: 'Hymns', icon: Music, href: '/hymns' },
    ],
  },
  {
    title: 'Finance',
    items: [{ label: 'Donations', icon: Gift, href: '/donations' }],
  },
  {
    title: 'System',
    items: [
      { label: 'Media Library', icon: Package, href: '/media' },
      { label: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 50,
          padding: '8px',
          borderRadius: '6px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          display: 'none',
        }}
        className="lg:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '256px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e5e7eb',
          transition: 'transform 0.3s ease',
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          overflowY: 'auto',
        }}
      >
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(to bottom right, #3b82f6, #1e3a8a)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cross size={24} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937' }}>Church</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              display: 'none',
              padding: '4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
            className="lg:block"
          >
            <ChevronLeft size={20} style={{ color: '#4b5563' }} />
          </button>
        </div>

        {/* Back Button */}
        {/* Navigation Sections */}
        <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '16px', paddingRight: '12px', paddingBottom: '16px', paddingLeft: '12px' }}>
          {/* Dashboard link */}
          <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: isActive('/dashboard') ? '#1B73E8' : '#374151',
                backgroundColor: isActive('/dashboard') ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <LayoutDashboard size={20} style={{ color: isActive('/dashboard') ? '#1B73E8' : '#6b7280' }} />
              Dashboard
            </Link>
          </div>
          {sidebarSections.map((section) => (
            <div key={section.title} style={{ marginBottom: '24px' }}>
              <h3 style={{ paddingLeft: '16px', marginBottom: '12px', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {section.title}
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          paddingTop: '10px',
                          paddingBottom: '10px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: 500,
                          textDecoration: 'none',
                          color: active ? '#fff' : '#374151',
                          backgroundColor: active ? '#1e40af' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <Icon size={18} style={{ flexShrink: 0 }} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '16px', textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          <p>Church Admin Panel v1.0</p>
        </div>
      </aside>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30,
            display: 'none',
          }}
          className="lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
