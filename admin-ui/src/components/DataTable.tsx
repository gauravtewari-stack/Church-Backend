import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, MoreHorizontal, Trash2, Copy } from 'lucide-react';
import type { TableColumn } from '../lib/types';

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (item: T) => void;
  emptyState?: string;
  showCheckbox?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  searchableColumns?: (keyof T)[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onDuplicate,
  emptyState = 'No items found',
  showCheckbox = true,
  onSelectionChange,
  searchableColumns = [],
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (!searchTerm) return true;
      return searchableColumns.some((col) => {
        const value = item[col];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, searchableColumns]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const comparison = aVal < bVal ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortOrder]);

  const toggleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedData.length) {
      setSelectedIds([]);
      onSelectionChange?.([]);
    } else {
      const newIds = sortedData.map((item) => item.id);
      setSelectedIds(newIds);
      onSelectionChange?.(newIds);
    }
  };

  const toggleSelect = (id: string) => {
    const newIds = selectedIds.includes(id) ? selectedIds.filter((sid) => sid !== id) : [...selectedIds, id];
    setSelectedIds(newIds);
    onSelectionChange?.(newIds);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outlineColor = '#1B73E8';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outlineColor = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {sortedData.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: '48px', paddingBottom: '48px' }}>
          <p style={{ color: '#6b7280' }}>{emptyState}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                {showCheckbox && (
                  <th style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', textAlign: 'left' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === sortedData.length && sortedData.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    style={{
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4b5563',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    onMouseEnter={(e) => {
                      if (col.sortable) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {col.label}
                      {col.sortable && sortKey === col.key && (sortOrder === 'asc' ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />)}
                    </div>
                  </th>
                ))}
                <th style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
              {sortedData.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s ease' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  {showCheckbox && (
                    <td style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', color: '#111827' }}>
                      {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                    </td>
                  ))}
                  <td style={{ paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', fontSize: '14px', position: 'relative' }}>
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <MoreHorizontal style={{ width: '16px', height: '16px', color: '#4b5563' }} />
                      </button>
                      {openMenuId === item.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            marginTop: '8px',
                            width: '192px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                          }}
                        >
                          <button
                            onClick={() => {
                              onEdit(item);
                              setOpenMenuId(null);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '8px',
                              paddingBottom: '8px',
                              fontSize: '14px',
                              color: '#374151',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Edit
                          </button>
                          {onDuplicate && (
                            <button
                              onClick={() => {
                                onDuplicate(item);
                                setOpenMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                paddingLeft: '16px',
                                paddingRight: '16px',
                                paddingTop: '8px',
                                paddingBottom: '8px',
                                fontSize: '14px',
                                color: '#374151',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background-color 0.2s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              <Copy style={{ width: '16px', height: '16px' }} /> Duplicate
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onDelete(item.id);
                              setOpenMenuId(null);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              paddingLeft: '16px',
                              paddingRight: '16px',
                              paddingTop: '8px',
                              paddingBottom: '8px',
                              fontSize: '14px',
                              color: '#dc2626',
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              borderTop: '1px solid #e5e7eb',
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Trash2 style={{ width: '16px', height: '16px' }} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
