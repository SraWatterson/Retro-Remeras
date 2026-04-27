'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ColorImageRow, ProductFormErrors, ProductFormState } from './types';

type Props = {
  title: string;
  editing: boolean;
  form: ProductFormState;
  colorRows: ColorImageRow[];
  errors: ProductFormErrors;
  categories: string[];
  requestError: string;
  saving: boolean;
  uploading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onChange: (patch: Partial<ProductFormState>) => void;
  onMainUpload: (file: File | null) => void;
  onMainDetach: () => void;
  onMainDeleteFile: () => void;
  onColorRowChange: (rowId: string, patch: Partial<ColorImageRow>) => void;
  onColorUpload: (rowId: string, file: File | null) => void;
  onColorDetach: (rowId: string) => void;
  onColorDeleteFile: (rowId: string) => void;
  onAddColorRow: () => void;
  onRemoveColorRow: (rowId: string) => void;
};

type CategoryMode = 'existing' | 'new';

function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function uniqueCategories(categories: string[]) {
  const byKey = new Map<string, string>();

  categories.forEach((category) => {
    const normalized = normalizeCategory(category);
    if (!normalized) return;

    const key = normalized.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, normalized);
    }
  });

  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'es'));
}

type CategoryFieldProps = {
  value: string;
  categories: string[];
  error?: string;
  onChange: (value: string) => void;
};

function CategoryField({ value, categories, error, onChange }: CategoryFieldProps) {
  const normalizedCategories = useMemo(() => uniqueCategories(categories), [categories]);
  const matchedCategory = normalizedCategories.find(
    (category) => category.toLowerCase() === normalizeCategory(value).toLowerCase()
  );
  const [mode, setMode] = useState<CategoryMode>('existing');

  useEffect(() => {
    const normalizedValue = normalizeCategory(value);
    if (!normalizedValue) return;

    setMode(matchedCategory ? 'existing' : 'new');
  }, [matchedCategory, value]);

  const selectValue = mode === 'new' ? '__new' : matchedCategory || '';

  return (
    <div className="form-group admin-category-field">
      <label className="form-label" htmlFor="categoria-select">Categoría *</label>
      <select
        id="categoria-select"
        className="input"
        value={selectValue}
        onChange={(event) => {
          const nextValue = event.target.value;

          if (nextValue === '__new') {
            setMode('new');
            onChange('');
            return;
          }

          setMode('existing');
          onChange(nextValue);
        }}
        required={mode === 'existing'}
      >
        <option value="">Seleccionar categoría</option>
        {normalizedCategories.map((category) => (
          <option value={category} key={category}>{category}</option>
        ))}
        <option value="__new">+ Crear nueva categoría</option>
      </select>

      {mode === 'new' ? (
        <div className="admin-new-category-box">
          <label className="form-label" htmlFor="categoria-new">Nueva categoría</label>
          <input
            id="categoria-new"
            className="input"
            value={value}
            placeholder="Ej: Cine retro"
            onChange={(event) => onChange(event.target.value)}
            required
          />
          <p className="admin-help">
            Se va a crear automáticamente cuando guardes el producto con esta categoría.
          </p>
        </div>
      ) : null}

      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}

export function ProductEditorForm({
  title,
  editing,
  form,
  colorRows,
  errors,
  categories,
  requestError,
  saving,
  uploading,
  onSubmit,
  onReset,
  onChange,
  onMainUpload,
  onMainDetach,
  onMainDeleteFile,
  onColorRowChange,
  onColorUpload,
  onColorDetach,
  onColorDeleteFile,
  onAddColorRow,
  onRemoveColorRow,
}: Props) {
  return (
    <section className="panel admin-form-panel">
      <div className="admin-form-heading">
        <h2>{title}</h2>
        {uploading ? <span className="admin-live-pill">Subiendo imagen...</span> : null}
      </div>

      <form className="filters" onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="legacyId">Legacy ID (opcional)</label>
          <input id="legacyId" className="input" value={form.legacyId} onChange={(event) => onChange({ legacyId: event.target.value ? Number.parseInt(event.target.value, 10) || '' : '' })} />
          {errors.legacyId ? <p className="admin-error">{errors.legacyId}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="slug">Slug *</label>
          <input id="slug" className="input" value={form.slug} onChange={(event) => onChange({ slug: event.target.value })} required />
          {errors.slug ? <p className="admin-error">{errors.slug}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="nombre">Nombre *</label>
          <input id="nombre" className="input" value={form.nombre} onChange={(event) => onChange({ nombre: event.target.value })} required />
          {errors.nombre ? <p className="admin-error">{errors.nombre}</p> : null}
        </div>

        <CategoryField
          value={form.categoria}
          categories={categories}
          error={errors.categoria}
          onChange={(categoria) => onChange({ categoria })}
        />

        <div className="form-group">
          <label className="form-label" htmlFor="precio">Precio *</label>
          <input id="precio" className="input" type="number" min={0} step={1} value={form.precio} onChange={(event) => onChange({ precio: event.target.value })} required />
          {errors.precio ? <p className="admin-error">{errors.precio}</p> : null}
        </div>

        <div className="form-group admin-upload-box">
          <label className="form-label">Imagen principal *</label>
          <div className={`admin-preview-wrap ${uploading ? 'is-busy' : ''}`} aria-busy={uploading}>
            {form.imagen ? <img className="admin-preview" src={form.imagen} alt="Imagen principal" loading="lazy" decoding="async" /> : <div className="admin-preview admin-preview--empty">Sin imagen</div>}
            {uploading ? <span className="admin-preview-loader" aria-hidden="true" /> : null}
          </div>

          <div className="admin-inline-actions">
            <label className={`btn btn-primary admin-upload-btn ${uploading ? 'is-disabled' : ''}`}>
              {uploading ? 'Subiendo...' : 'Subir imagen'}
              <input className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || saving} onChange={(event) => onMainUpload(event.target.files?.[0] || null)} />
            </label>
            <button className="btn btn-secondary" type="button" disabled={uploading || saving} onClick={onMainDetach}>Quitar del producto</button>
            <button className="btn btn-ghost" type="button" disabled={uploading || saving} onClick={onMainDeleteFile}>Eliminar archivo</button>
          </div>
          {errors.imagen ? <p className="admin-error">{errors.imagen}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label">Imágenes por color</label>
          <div className="admin-color-list">
            {colorRows.map((row) => (
              <div className="admin-color-row" key={row.id}>
                <input className="input" placeholder="Color (ej: Negro)" value={row.color} disabled={saving} onChange={(event) => onColorRowChange(row.id, { color: event.target.value })} />

                <div className={`admin-preview-wrap ${uploading ? 'is-busy' : ''}`} aria-busy={uploading}>
                  {row.path ? <img className="admin-preview admin-preview--small" src={row.path} alt={`Color ${row.color || 'sin nombre'}`} loading="lazy" decoding="async" /> : <div className="admin-preview admin-preview--small admin-preview--empty">Sin imagen</div>}
                  {uploading ? <span className="admin-preview-loader" aria-hidden="true" /> : null}
                </div>

                <div className="admin-inline-actions">
                  <label className={`btn btn-primary admin-upload-btn ${uploading ? 'is-disabled' : ''}`}>
                    {uploading ? 'Subiendo...' : 'Subir'}
                    <input className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || saving} onChange={(event) => onColorUpload(row.id, event.target.files?.[0] || null)} />
                  </label>
                  <button className="btn btn-secondary" type="button" disabled={uploading || saving} onClick={() => onColorDetach(row.id)}>Quitar</button>
                  <button className="btn btn-ghost" type="button" disabled={uploading || saving} onClick={() => onColorDeleteFile(row.id)}>Eliminar archivo</button>
                  <button className="btn btn-ghost" type="button" disabled={uploading || saving} onClick={() => onRemoveColorRow(row.id)}>Eliminar color</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" type="button" disabled={uploading || saving} onClick={onAddColorRow}>Agregar color</button>
          {errors.colorImages ? <p className="admin-error">{errors.colorImages}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="descripcion">Descripción *</label>
          <textarea id="descripcion" className="input admin-textarea" value={form.descripcion} onChange={(event) => onChange({ descripcion: event.target.value })} required />
          {errors.descripcion ? <p className="admin-error">{errors.descripcion}</p> : null}
        </div>

        <div className="admin-switches">
          <label><input type="checkbox" checked={form.disponible} onChange={(event) => onChange({ disponible: event.target.checked })} /> Disponible</label>
          <label><input type="checkbox" checked={form.destacado} onChange={(event) => onChange({ destacado: event.target.checked })} /> Destacado</label>
          <label><input type="checkbox" checked={form.activo} onChange={(event) => onChange({ activo: event.target.checked })} /> Activo</label>
        </div>

        {requestError ? <p className="admin-error">{requestError}</p> : null}

        <div className="admin-actions">
          <button className="btn btn-primary admin-submit-btn" type="submit" disabled={saving || uploading} aria-busy={saving}>
            {saving ? <span className="admin-btn-spinner" aria-hidden="true" /> : null}
            {saving ? 'Guardando...' : editing ? 'Actualizar producto' : 'Crear producto'}
          </button>
          {editing ? <button className="btn btn-secondary" type="button" disabled={saving || uploading} onClick={onReset}>Cancelar edición</button> : null}
        </div>
      </form>
    </section>
  );
}
