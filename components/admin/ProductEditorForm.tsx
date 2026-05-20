'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { ProductColorOption } from '@/lib/colors';
import { ProductSizeGuide, SizeGuideTable } from '@/lib/shop';
import { ColorDraft, ColorImageRow, ProductFormErrors, ProductFormState } from './types';

type Props = {
  title: string;
  editing: boolean;
  form: ProductFormState;
  colorRows: ColorImageRow[];
  colors: ProductColorOption[];
  colorDraft: ColorDraft;
  colorSaving: boolean;
  colorError: string;
  errors: ProductFormErrors;
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
  onColorDraftChange: (patch: Partial<ColorDraft>) => void;
  onCreateColor: () => void;
  onDeleteColor: (color: ProductColorOption) => void;
};

function normalizeAdminImageSrc(src?: string | null) {
  if (!src) return null;

  const value = String(src).trim();
  if (!value) return null;

  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('/')) return value;

  return `/${value.replace(/^\/+/, '')}`;
}

type CategoryFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function CategoryField({ value, error, onChange }: CategoryFieldProps) {
  const [options, setOptions] = useState<{ title: string; slug: string }[]>([]);

  useEffect(() => {
    fetch('/api/landing-categories')
      .then((r) => r.ok ? r.json() : [])
      .then((data: { title: string; slug: string }[]) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => setOptions([]));
  }, []);

  return (
    <div className="form-group admin-category-field">
      <label className="form-label" htmlFor="categoria-select">Categoría *</label>
      <select
        id="categoria-select"
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        <option value="">Seleccionar categoría</option>
        {options.map((cat) => (
          <option value={cat.title} key={cat.slug}>{cat.title}</option>
        ))}
      </select>
      <p className="admin-help">Las categorías se gestionan desde la sección "Cards landing" del panel.</p>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}


type SizeGuideEditorProps = {
  value: ProductSizeGuide;
  disabled: boolean;
  error?: string;
  onChange: (value: ProductSizeGuide) => void;
};

const SIZE_GUIDE_LABELS: Record<'regular' | 'oversize', string> = {
  regular: 'Regular',
  oversize: 'Oversize',
};

function emptyTable(): SizeGuideTable {
  return {
    columns: ['Talle', 'Ancho', 'Largo'],
    rows: [],
  };
}

function normalizeTable(table?: SizeGuideTable): SizeGuideTable {
  const columns = table?.columns?.length ? table.columns : ['Talle', 'Ancho', 'Largo'];
  const rows = table?.rows || [];
  return { columns, rows };
}

function SizeGuideEditor({ value, disabled, error, onChange }: SizeGuideEditorProps) {
  const updateTable = (fit: 'regular' | 'oversize', table: SizeGuideTable) => {
    onChange({
      ...value,
      [fit]: table,
    });
  };

  const updateColumn = (fit: 'regular' | 'oversize', columnIndex: number, nextValue: string) => {
    const table = normalizeTable(value[fit]);
    const columns = table.columns.map((column, index) => (index === columnIndex ? nextValue : column));
    updateTable(fit, { ...table, columns });
  };

  const addColumn = (fit: 'regular' | 'oversize') => {
    const table = normalizeTable(value[fit]);
    const columns = [...table.columns, `Columna ${table.columns.length + 1}`];
    const rows = table.rows.map((row) => [...row, '']);
    updateTable(fit, { columns, rows });
  };

  const removeColumn = (fit: 'regular' | 'oversize', columnIndex: number) => {
    const table = normalizeTable(value[fit]);
    if (table.columns.length <= 1) return;

    const columns = table.columns.filter((_, index) => index !== columnIndex);
    const rows = table.rows.map((row) => row.filter((_, index) => index !== columnIndex));
    updateTable(fit, { columns, rows });
  };

  const addRow = (fit: 'regular' | 'oversize') => {
    const table = normalizeTable(value[fit]);
    updateTable(fit, {
      ...table,
      rows: [...table.rows, table.columns.map(() => '')],
    });
  };

  const removeRow = (fit: 'regular' | 'oversize', rowIndex: number) => {
    const table = normalizeTable(value[fit]);
    updateTable(fit, {
      ...table,
      rows: table.rows.filter((_, index) => index !== rowIndex),
    });
  };

  const updateCell = (fit: 'regular' | 'oversize', rowIndex: number, columnIndex: number, nextValue: string) => {
    const table = normalizeTable(value[fit]);
    const rows = table.rows.map((row, currentRowIndex) => {
      if (currentRowIndex !== rowIndex) return row;

      const nextRow = [...row];
      while (nextRow.length < table.columns.length) nextRow.push('');
      nextRow[columnIndex] = nextValue;
      return nextRow;
    });

    updateTable(fit, { ...table, rows });
  };

  return (
    <details className="admin-size-guide-editor">
      <summary>
        <span>Tabla de talles editable</span>
      </summary>

      <div className="admin-size-guide-intro">
        <p className="admin-help">
          Editá los nombres de columnas y completá las medidas. La página pública va a mostrar exactamente esta estructura.
        </p>
      </div>

      <div className="admin-size-guide-groups">
        {(['regular', 'oversize'] as const).map((fit) => {
          const table = normalizeTable(value[fit]);

          return (
            <div className="admin-size-guide-group" key={fit}>
              <div className="admin-size-guide-head">
                <div>
                  <strong>{SIZE_GUIDE_LABELS[fit]}</strong>
                  <p>{fit === 'regular' ? 'Medidas para corte clásico.' : 'Medidas para corte más amplio.'}</p>
                </div>
              </div>

              <div className="admin-size-guide-columns" aria-label={`Columnas de tabla ${SIZE_GUIDE_LABELS[fit]}`}>
                <div className="admin-size-guide-subhead">
                  <span className="admin-size-guide-label">Columnas</span>
                  <button className="btn btn-secondary" type="button" disabled={disabled} onClick={() => addColumn(fit)}>
                    + Columna
                  </button>
                </div>

                <div className="admin-size-guide-column-list">
                  {table.columns.map((column, columnIndex) => (
                    <div className="admin-size-guide-column-editor" key={`${fit}-column-${columnIndex}`}>
                      <input
                        className="input"
                        value={column}
                        placeholder={`Columna ${columnIndex + 1}`}
                        disabled={disabled}
                        onChange={(event) => updateColumn(fit, columnIndex, event.target.value)}
                        aria-label={`Nombre de columna ${columnIndex + 1}`}
                      />
                      <button
                        className="admin-size-guide-remove-column"
                        type="button"
                        disabled={disabled || table.columns.length <= 1}
                        onClick={() => removeColumn(fit, columnIndex)}
                        aria-label={`Quitar columna ${column || columnIndex + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-size-guide-rows">
                <div className="admin-size-guide-subhead">
                  <span className="admin-size-guide-label">Medidas</span>
                </div>

                <div className="admin-size-guide-table" role="table" aria-label={`Tabla de talles ${SIZE_GUIDE_LABELS[fit]}`}>
                  {table.rows.length ? (
                    table.rows.map((row, rowIndex) => (
                      <div className="admin-size-guide-row" role="row" key={`${fit}-row-${rowIndex}`}>
                        {table.columns.map((column, columnIndex) => (
                          <input
                            className="input"
                            key={`${fit}-${rowIndex}-${columnIndex}`}
                            value={row[columnIndex] || ''}
                            placeholder={column}
                            disabled={disabled}
                            onChange={(event) => updateCell(fit, rowIndex, columnIndex, event.target.value)}
                            aria-label={`${SIZE_GUIDE_LABELS[fit]} fila ${rowIndex + 1}, ${column}`}
                          />
                        ))}
                        <button
                          className="admin-size-guide-remove-row"
                          type="button"
                          disabled={disabled}
                          onClick={() => removeRow(fit, rowIndex)}
                          aria-label={`Quitar fila ${rowIndex + 1} de ${SIZE_GUIDE_LABELS[fit]}`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="admin-size-guide-empty">
                      Sin filas cargadas para {SIZE_GUIDE_LABELS[fit]}. Usá “+ Fila” para agregar una.
                    </div>
                  )}
                </div>

                <button className="btn btn-secondary admin-size-guide-add-row" type="button" disabled={disabled} onClick={() => addRow(fit)}>
                  + Agregar fila
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
    </details>
  );
}

export function ProductEditorForm({
  title,
  editing,
  form,
  colorRows,
  colors,
  colorDraft,
  colorSaving,
  colorError,
  errors,
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
  onColorDraftChange,
  onCreateColor,
  onDeleteColor,
}: Props) {
  const customColors = colors.filter((color) => color.canDelete);

  return (
    <section className="panel admin-form-panel">
      <div className="admin-form-heading">
        <h2>{title}</h2>
        {uploading ? <span className="admin-live-pill">Subiendo imagen...</span> : null}
      </div>

      <form className="filters" onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="nombre">Nombre *</label>
          <input id="nombre" className="input" value={form.nombre} onChange={(event) => onChange({ nombre: event.target.value })} required />
          {errors.nombre ? <p className="admin-error">{errors.nombre}</p> : null}
        </div>

        <CategoryField
          value={form.categoria}
          error={errors.categoria}
          onChange={(categoria) => onChange({ categoria })}
        />

        <div className="form-group">
          <label className="form-label" htmlFor="precio">Precio *</label>
          <input id="precio" className="input" type="number" min={0} step={1} value={form.precio} onChange={(event) => onChange({ precio: event.target.value })} required />
          {errors.precio ? <p className="admin-error">{errors.precio}</p> : null}
        </div>

        <details className="admin-advanced-fields">
          <summary>Ajustes técnicos avanzados</summary>
          <p className="admin-help">Normalmente no hace falta tocar esto. El slug se usa para URLs y compatibilidad interna.</p>
          <div className="admin-advanced-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="slug">Slug</label>
              <input id="slug" className="input" value={form.slug} placeholder="Se genera desde el nombre si queda vacío" onChange={(event) => onChange({ slug: event.target.value })} />
              {errors.slug ? <p className="admin-error">{errors.slug}</p> : null}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="legacyId">Legacy ID</label>
              <input id="legacyId" className="input" value={form.legacyId} onChange={(event) => onChange({ legacyId: event.target.value ? Number.parseInt(event.target.value, 10) || '' : '' })} />
              {errors.legacyId ? <p className="admin-error">{errors.legacyId}</p> : null}
            </div>
          </div>
        </details>


        <div className="form-group">
          <SizeGuideEditor
            value={form.sizeGuide}
            disabled={saving || uploading}
            error={errors.sizeGuide}
            onChange={(sizeGuide) => onChange({ sizeGuide })}
          />
        </div>

        <div className="form-group admin-upload-box">
          <label className="form-label">Imagen principal *</label>
          <div className={`admin-preview-wrap ${uploading ? 'is-busy' : ''}`} aria-busy={uploading}>
            {(() => {
              const previewSrc = normalizeAdminImageSrc(form.imagen);

              return previewSrc ? (
                <Image className="admin-preview" src={previewSrc} alt="Imagen principal" width={420} height={420} sizes="(max-width: 767px) 90vw, 420px" />
              ) : (
                <div className="admin-preview admin-preview--empty">Sin imagen</div>
              );
            })()}
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
          <div className="admin-color-section-head">
            <div>
              <label className="form-label">Colores del producto</label>
              <p className="admin-help">Asigná los colores disponibles. Sin imagen específica, se muestra la imagen principal automáticamente.</p>
            </div>
          </div>

          <div className="admin-new-color-box">
            <div>
              <strong>Agregar nuevo color</strong>
              <p className="admin-help">Crealo una vez y después reutilizalo en cualquier producto.</p>
            </div>
            <input className="input" placeholder="Nombre del color" value={colorDraft.name} disabled={saving || colorSaving} onChange={(event) => onColorDraftChange({ name: event.target.value })} />
            <label className="admin-color-picker-label">
              <span className="admin-color-preview" style={{ backgroundColor: colorDraft.hex }} aria-hidden="true" />
              <input type="color" value={colorDraft.hex} disabled={saving || colorSaving} onChange={(event) => onColorDraftChange({ hex: event.target.value })} />
              <span>{colorDraft.hex.toUpperCase()}</span>
            </label>
            <button className="btn btn-secondary" type="button" disabled={saving || uploading || colorSaving} onClick={onCreateColor}>
              {colorSaving ? 'Creando...' : '+ Crear color'}
            </button>
          </div>
          {colorError ? <p className="admin-error">{colorError}</p> : null}

          {customColors.length ? (
            <div className="admin-custom-colors-box">
              <div>
                <strong>Colores personalizados</strong>
                <p className="admin-help">Podés eliminar definitivamente los colores creados manualmente si no están en uso.</p>
              </div>
              <div className="admin-custom-colors-list">
                {customColors.map((color) => (
                  <div className="admin-custom-color-chip" key={color.slug}>
                    <span className="admin-color-preview" style={{ backgroundColor: color.hex }} aria-hidden="true" />
                    <span>{color.name}</span>
                    <button className="btn btn-ghost btn-danger-soft" type="button" disabled={saving || uploading || colorSaving} onClick={() => onDeleteColor(color)}>
                      Eliminar definitivamente
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="admin-color-list">
            {colorRows.map((row) => (
              <div className="admin-color-row" key={row.id}>
                <div className="admin-color-select-stack">
                  <label className="form-label" htmlFor={`color-${row.id}`}>Color</label>
                  <select
                    id={`color-${row.id}`}
                    className="input"
                    value={row.colorSlug}
                    disabled={saving}
                    onChange={(event) => onColorRowChange(row.id, { colorSlug: event.target.value })}
                  >
                    <option value="">Seleccionar color</option>
                    {colors.map((color) => (
                      <option value={color.slug} key={color.slug}>{color.name}</option>
                    ))}
                  </select>
                  {row.colorName ? (
                    <span className="admin-selected-color">
                      <span className="admin-color-preview" style={{ backgroundColor: row.colorHex }} aria-hidden="true" />
                      {row.colorName}
                    </span>
                  ) : null}
                </div>

                <div className={`admin-preview-wrap ${uploading ? 'is-busy' : ''}`} aria-busy={uploading}>
                  {(() => {
                    const specificSrc = normalizeAdminImageSrc(row.path);
                    const fallbackSrc = normalizeAdminImageSrc(form.imagen);
                    const previewSrc = specificSrc || fallbackSrc;
                    const isUsingMain = !specificSrc && Boolean(fallbackSrc);

                    return previewSrc ? (
                      <div className="admin-preview-relative">
                        <Image
                          className={`admin-preview admin-preview--small${isUsingMain ? ' admin-preview--dimmed' : ''}`}
                          src={previewSrc}
                          alt={`Color ${row.colorName || 'sin nombre'}`}
                          width={180}
                          height={180}
                          sizes="96px"
                        />
                        {isUsingMain && (
                          <span className="admin-preview-badge">Imagen principal</span>
                        )}
                      </div>
                    ) : (
                      <div className="admin-preview admin-preview--small admin-preview--empty">Sin imagen</div>
                    );
                  })()}
                  {uploading ? <span className="admin-preview-loader" aria-hidden="true" /> : null}
                </div>

                <div className="admin-inline-actions">
                  <label className={`btn btn-secondary admin-upload-btn ${uploading ? 'is-disabled' : ''}`}>
                    {uploading ? 'Subiendo...' : (row.path ? 'Cambiar imagen' : 'Imagen específica')}
                    <input className="admin-file-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || saving} onChange={(event) => onColorUpload(row.id, event.target.files?.[0] || null)} />
                  </label>
                  {row.path && (
                    <>
                      <button className="btn btn-secondary" type="button" disabled={uploading || saving} onClick={() => onColorDetach(row.id)}>Quitar imagen</button>
                      <button className="btn btn-ghost" type="button" disabled={uploading || saving} onClick={() => onColorDeleteFile(row.id)}>Eliminar archivo</button>
                    </>
                  )}
                  <button className="btn btn-ghost" type="button" disabled={uploading || saving} onClick={() => onRemoveColorRow(row.id)}>Eliminar color</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" type="button" disabled={uploading || saving} onClick={onAddColorRow}>+ Agregar color</button>
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
