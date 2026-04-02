import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Film, Music } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import type { FormField } from '../lib/types';

interface EntityFormProps {
  fields: FormField[];
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel: () => void;
  submitLabel?: string;
  title?: string;
}

function FileUploadField({ field, onFileSelect, selectedFile, accept }: {
  field: FormField;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleClick = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const resolvedAccept = accept || field.accept;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image size={24} style={{ color: '#3b82f6' }} />;
    if (file.type.startsWith('video/')) return <Film size={24} style={{ color: '#8b5cf6' }} />;
    if (file.type.startsWith('audio/')) return <Music size={24} style={{ color: '#f59e0b' }} />;
    return <FileText size={24} style={{ color: '#6b7280' }} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getAcceptLabel = (acc: string) => {
    if (acc === 'image/*') return 'Images (PNG, JPG, GIF, SVG, WebP)';
    if (acc === 'video/*') return 'Videos (MP4, MOV, AVI, WebM)';
    if (acc === 'audio/*') return 'Audio files (MP3, WAV, OGG, AAC)';
    if (acc.startsWith('.')) return 'Documents (PDF, DOC, DOCX, TXT, XLS, PPT)';
    return acc;
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={resolvedAccept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {selectedFile ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}>
          {getFileIcon(selectedFile)}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
              {formatSize(selectedFile.size)}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            style={{
              padding: '4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? '#1B73E8' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '32px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? '#eff6ff' : '#fafafa',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = '#93c5fd';
              e.currentTarget.style.backgroundColor = '#f0f7ff';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }
          }}
        >
          <Upload size={32} style={{ color: isDragging ? '#1B73E8' : '#9ca3af', margin: '0 auto 8px' }} />
          <div style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>
            {isDragging ? 'Drop file here' : 'Drag & drop a file here, or click to browse'}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            {resolvedAccept ? getAcceptLabel(resolvedAccept) : 'All file types supported'}
          </div>
        </div>
      )}
    </div>
  );
}

export function EntityForm({
  fields,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  title = 'Form',
}: EntityFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [richTextValues, setRichTextValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.type === 'richtext') {
        defaults[f.name] = initialValues[f.name] || f.defaultValue || '';
      }
    });
    return defaults;
  });
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    fields.forEach((f) => {
      if (initialValues[f.name] != null) {
        defaults[f.name] = String(initialValues[f.name]);
      } else if (f.defaultValue != null) {
        defaults[f.name] = String(f.defaultValue);
      }
    });
    return defaults;
  });

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (fieldName: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: Record<string, any> = {};

    fields.forEach((field) => {
      if (field.type === 'file') {
        const file = uploadedFiles[field.name];
        if (file) {
          values[field.name] = file;
          values[field.name + '_name'] = file.name;
          values[field.name + '_size'] = file.size;
          values[field.name + '_type'] = file.type;
        }
      } else if (field.type === 'richtext') {
        values[field.name] = richTextValues[field.name] || '';
      } else if (field.type === 'checkbox') {
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

  const isFieldVisible = (field: FormField) => {
    if (!field.dependsOn) return true;
    const depValue = fieldValues[field.dependsOn.field];
    return !!depValue;
  };

  const getFileAccept = (field: FormField) => {
    if (!field.dependsOn?.acceptMap) return field.accept;
    const depValue = fieldValues[field.dependsOn.field];
    return depValue ? field.dependsOn.acceptMap[depValue] : field.accept;
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{title}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {fields.map((field) => {
            if (!isFieldVisible(field)) return null;

            return (
              <div key={field.name} style={{ gridColumn: (field.type === 'textarea' || field.type === 'richtext' || field.type === 'file') ? '1 / -1' : 'span 1' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  {field.label}
                  {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>

                {field.type === 'file' ? (
                  <FileUploadField
                    field={field}
                    onFileSelect={(file) => handleFileSelect(field.name, file)}
                    selectedFile={uploadedFiles[field.name] || null}
                    accept={getFileAccept(field)}
                  />
                ) : field.type === 'richtext' ? (
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '8px', overflow: 'hidden' }}>
                    <ReactQuill
                      theme="snow"
                      value={richTextValues[field.name] || ''}
                      onChange={(value) => setRichTextValues(prev => ({ ...prev, [field.name]: value }))}
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ list: 'ordered' }, { list: 'bullet' }],
                          ['blockquote', 'link'],
                          ['clean'],
                        ],
                      }}
                      style={{ minHeight: '160px' }}
                    />
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={initialValues[field.name] || field.defaultValue || ''}
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
                    defaultValue={initialValues[field.name] || field.defaultValue || ''}
                    required={field.required}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
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
                    defaultValue={initialValues[field.name] || field.defaultValue || ''}
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
            );
          })}
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
