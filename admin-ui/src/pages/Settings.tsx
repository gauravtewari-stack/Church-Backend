import { useState } from 'react';
import { useToast } from '../lib/toast';

export default function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState({
    autoApproveProviders: false,
    requireEmailVerification: true,
  });

  const handleToggle = (key: 'autoApproveProviders' | 'requireEmailVerification') => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    const label = key === 'autoApproveProviders' ? 'Auto-Approve' : 'Email Verification';
    toast.toast(`${label} setting updated`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '32px' }}>Settings</h1>

        {/* Sub-navigation */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: '2px solid #1B73E8',
                color: '#1B73E8',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottomColor: '#1B73E8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Configuration Settings
            </button>
            <button
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: '2px solid transparent',
                color: '#4b5563',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
            >
              Language Settings
            </button>
            <button
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: '2px solid transparent',
                color: '#4b5563',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
            >
              App Icon Settings
            </button>
            <button
              style={{
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: '2px solid transparent',
                color: '#4b5563',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
            >
              CMS Page
            </button>
          </div>
        </div>

        {/* Settings Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Auto-Approve Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Auto-Approve Job Providers</h2>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>
                  Automatically approve new job provider accounts when they sign up. When enabled, providers will have immediate access to the platform.
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoApproveProviders')}
                style={{
                  marginLeft: '16px',
                  position: 'relative',
                  display: 'inline-flex',
                  height: '32px',
                  width: '56px',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                  backgroundColor: settings.autoApproveProviders ? '#1B73E8' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    height: '24px',
                    width: '24px',
                    transform: settings.autoApproveProviders ? 'translateX(28px)' : 'translateX(4px)',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Current status: {settings.autoApproveProviders ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          {/* Email Verification Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Require Email Verification</h2>
                <p style={{ fontSize: '14px', color: '#4b5563' }}>
                  Require users to verify their email address before they can access the platform. This helps ensure valid contact information and account security.
                </p>
              </div>
              <button
                onClick={() => handleToggle('requireEmailVerification')}
                style={{
                  marginLeft: '16px',
                  position: 'relative',
                  display: 'inline-flex',
                  height: '32px',
                  width: '56px',
                  alignItems: 'center',
                  borderRadius: '9999px',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                  backgroundColor: settings.requireEmailVerification ? '#1B73E8' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    height: '24px',
                    width: '24px',
                    transform: settings.requireEmailVerification ? 'translateX(28px)' : 'translateX(4px)',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '12px', color: '#6b7280' }}>Current status: {settings.requireEmailVerification ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ fontWeight: 600, color: '#1e3a8a', marginBottom: '8px' }}>Configuration Tips</h3>
          <ul style={{ fontSize: '14px', color: '#1e40af', display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', paddingLeft: '16px' }}>
            <li style={{ position: 'relative', paddingLeft: '12px' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>Changes to these settings take effect immediately
            </li>
            <li style={{ position: 'relative', paddingLeft: '12px' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>Email verification can help reduce spam and invalid signups
            </li>
            <li style={{ position: 'relative', paddingLeft: '12px' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>Auto-approval speeds up onboarding but may require additional moderation
            </li>
            <li style={{ position: 'relative', paddingLeft: '12px' }}>
              <span style={{ position: 'absolute', left: 0 }}>•</span>All configuration changes are logged for audit purposes
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
