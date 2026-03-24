import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const config = {
    success: {
      bg: '#dffcf0',
      border: '#10b981',
      icon: CheckCircle,
      iconColor: '#059669',
      textColor: '#065f46',
    },
    error: {
      bg: '#fee2e2',
      border: '#ef4444',
      icon: AlertCircle,
      iconColor: '#dc2626',
      textColor: '#991b1b',
    },
    warning: {
      bg: '#fef3c7',
      border: '#fbbf24',
      icon: AlertTriangle,
      iconColor: '#f59e0b',
      textColor: '#b45309',
    },
    info: {
      bg: '#dbeafe',
      border: '#3b82f6',
      icon: Info,
      iconColor: '#1d4ed8',
      textColor: '#1e40af',
    },
  };

  const { bg, border, icon: Icon, iconColor, textColor } = config[type];

  return (
    <div
      style={{
        backgroundColor: bg,
        borderLeft: `4px solid ${border}`,
        borderRadius: '6px',
        padding: '16px',
        minWidth: '320px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
      <p style={{ fontSize: '14px', fontWeight: 500, flex: 1, color: textColor }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: textColor,
          opacity: 0.7,
          transition: 'opacity 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <X size={18} />
      </button>
    </div>
  );
}
