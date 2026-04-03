import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';
import { DataTable } from '../components/DataTable';
import { EntityForm } from '../components/EntityForm';
import type { TableColumn, FormField } from '../lib/types';

interface ModulePageProps<T> {
  moduleName: string;
  moduleLabel: string;
  columns: TableColumn<T>[];
  formFields: FormField[];
  searchableColumns: (keyof T)[];
  pageTitle: string;
  itemName: string;
  createDefaultItem: (id: string, values: any) => T;
}

export function ModulePage<T extends { id: string }>({
  moduleName,
  moduleLabel,
  columns,
  formFields,
  searchableColumns,
  pageTitle: _pageTitle,
  itemName,
  createDefaultItem,
}: ModulePageProps<T>) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const moduleKey = moduleName as keyof typeof state;
  const items = (state[moduleKey] as unknown) as T[];
  const editingItem = editingId ? items.find((s) => s.id === editingId) : null;

  const initialValues = editingItem
    ? formFields.reduce((acc, field) => {
        let val = (editingItem as any)[field.name] || field.defaultValue || '';
        if (field.type === 'date' && val) val = val.split('T')[0];
        acc[field.name] = val;
        return acc;
      }, {} as Record<string, any>)
    : formFields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || '';
        return acc;
      }, {} as Record<string, any>);

  const handleSubmit = (values: Record<string, any>) => {
    if (editingId) {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: { module: moduleName, id: editingId, updates: values },
      });
      toast.toast(`${itemName} updated successfully`, 'success');
      setEditingId(null);
    } else {
      const id = crypto.randomUUID();
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          module: moduleName,
          item: createDefaultItem(id, values),
        },
      });
      toast.toast(`${itemName} created successfully`, 'success');
    }
    setShowForm(false);
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: { module: moduleName, id } });
    toast.toast(`${itemName} deleted`, 'success');
  };

  const handleDuplicate = (item: T) => {
    dispatch({ type: 'DUPLICATE_ITEM', payload: { module: moduleName, id: item.id } });
    toast.toast(`${itemName} duplicated`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '24px' }}>
          {!showForm && (
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                backgroundColor: '#1B73E8',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1556c9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1B73E8')}
            >
              <Plus style={{ width: '20px', height: '20px' }} /> Add {itemName}
            </button>
          )}
        </div>

        {showForm ? (
          <EntityForm
            fields={formFields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            submitLabel={editingId ? 'Update' : 'Create'}
            title={editingId ? `Edit ${itemName}` : `New ${itemName}`}
          />
        ) : (
          <DataTable
            columns={columns}
            data={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            emptyState={`No ${moduleLabel.toLowerCase()} found. Create your first ${itemName.toLowerCase()}!`}
            searchableColumns={searchableColumns}
          />
        )}
      </div>
    </div>
  );
}
