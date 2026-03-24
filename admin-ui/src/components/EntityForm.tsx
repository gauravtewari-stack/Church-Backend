import type { FormField } from '../lib/types';

interface EntityFormProps {
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  submitLabel?: string;
  title?: string;
}

export function EntityForm({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  title = 'Form',
}: EntityFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: Record<string, any> = {};

    fields.forEach((field) => {
      if (field.type === 'checkbox') {
        values[field.name] = formData.get(field.name) === 'on';
      } else if (field.type === 'number') {
        const value = formData.get(field.name);
        values[field.name] = value ? parseFloat(value as string) : null;
      } else {
        values[field.name] = formData.get(field.name);
      }
    });

    onSubmit(values);
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{title}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {fields.map((field) => (
            <div key={field.name} style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                {field.label}
                {field.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={initialValues[field.name] || ''}
                  required={field.required}
                  maxLength={field.maxLength}
                  style={{
                    width: '100%',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                    resize: 'none',
                    minHeight: '100px',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B73E8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  defaultValue={initialValues[field.name] || ''}
                  required={field.required}
                  style={{
                    width: '100%',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B73E8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    name={field.name}
                    defaultChecked={initialValues[field.name] || false}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label style={{ marginLeft: '8px', fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>{field.label}</label>
                </div>
              ) : field.type === 'color' ? (
                <input
                  type="color"
                  name={field.name}
                  defaultValue={initialValues[field.name] || '#000000'}
                  required={field.required}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B73E8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={initialValues[field.name] || ''}
                  required={field.required}
                  maxLength={field.maxLength}
                  min={field.min}
                  max={field.max}
                  style={{
                    width: '100%',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#1B73E8';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 115, 232, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontWeight: 500,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
              backgroundColor: '#1B73E8',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1556c9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1B73E8')}
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
