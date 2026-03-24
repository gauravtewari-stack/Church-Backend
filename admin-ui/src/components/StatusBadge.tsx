interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  let bgColor = '#f3f4f6';
  let textColor = '#374151';

  if (variant) {
    const variantMap = {
      default: { bg: '#f3f4f6', text: '#374151' },
      success: { bg: '#dffcf0', text: '#065f46' },
      warning: { bg: '#fef3c7', text: '#b45309' },
      danger: { bg: '#fee2e2', text: '#991b1b' },
      info: { bg: '#dbeafe', text: '#1e40af' },
    };
    const config = variantMap[variant];
    bgColor = config.bg;
    textColor = config.text;
  } else {
    const statusMap: Record<string, { bg: string; text: string }> = {
      draft: { bg: '#f3f4f6', text: '#374151' },
      published: { bg: '#dffcf0', text: '#065f46' },
      scheduled: { bg: '#dbeafe', text: '#1e40af' },
      archived: { bg: '#fee2e2', text: '#991b1b' },
      active: { bg: '#dffcf0', text: '#065f46' },
      inactive: { bg: '#f3f4f6', text: '#374151' },
      live: { bg: '#fee2e2', text: '#991b1b' },
      pending: { bg: '#fef3c7', text: '#b45309' },
    };
    const config = statusMap[status.toLowerCase()] || statusMap.draft;
    bgColor = config.bg;
    textColor = config.text;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '4px',
        paddingBottom: '4px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
