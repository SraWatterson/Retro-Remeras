import { ColorImageRow, ProductFormErrors, ProductFormState } from './types';

type Props = {
  title: string;
  editing: boolean;
  form: ProductFormState;
  colorRows: ColorImageRow[];
  errors: ProductFormErrors;
  requestError: string;
  saving: boolean;
  uploading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
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

export function ProductEditorForm({
  title,
  editing,
  form,
  colorRows,
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
}: Props) {
  return (
    <section className="panel admin-form-panel">
      <h2>{title}</h2>

      <form className="filters" onSubmit={onSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="legacyId">Legacy ID (opcional)</label>
          <input id="legacyId" className="input" value={form.legacyId} onChange={(event) => onChange({ legacyId: event.target.value })} />
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

        <div className="form-group">
          <label className="form-label" htmlFor="categoria">Categoría *</label>
          <input id="categoria" className="input" value={form.categoria} onChange={(event) => onChange({ categoria: event.target.value })} required />
          {errors.categoria ? <p className="admin-error">{errors.categoria}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="precio">Precio *</label>
          <input id="precio" className="input" type="number" min={0} step={1} value={form.precio} onChange={(event) => onChange({ precio: event.target.value })} required />
          {errors.precio ? <p className="admin-error">{errors.precio}</p> : null}
        </div>

        <div className="form-group admin-upload-box">
          <label className="form-label">Imagen principal *</label>
          <div className="admin-preview-wrap">
            {form.imagen ? <img className="admin-preview" src={form.imagen} alt="Imagen principal" /> : <div className="admin-preview admin-preview--empty">Sin imagen</div>}
          </div>

          <div className="admin-inline-actions">
            <label className="btn btn-primary admin-upload-btn">
              Subir imagen
              <input className="admin-file-input" type="file" accept="image/*" onChange={(event) => onMainUpload(event.target.files?.[0] || null)} />
            </label>
            <button className="btn btn-secondary" type="button" onClick={onMainDetach}>Quitar del producto</button>
            <button className="btn btn-ghost" type="button" onClick={onMainDeleteFile}>Eliminar archivo</button>
          </div>
          {errors.imagen ? <p className="admin-error">{errors.imagen}</p> : null}
        </div>

        <div className="form-group">
          <label className="form-label">Imágenes por color</label>
          <div className="admin-color-list">
            {colorRows.map((row) => (
              <div className="admin-color-row" key={row.id}>
                <input className="input" placeholder="Color (ej: Negro)" value={row.color} onChange={(event) => onColorRowChange(row.id, { color: event.target.value })} />

                <div className="admin-preview-wrap">
                  {row.path ? <img className="admin-preview admin-preview--small" src={row.path} alt={`Color ${row.color || 'sin nombre'}`} /> : <div className="admin-preview admin-preview--small admin-preview--empty">Sin imagen</div>}
                </div>

                <div className="admin-inline-actions">
                  <label className="btn btn-primary admin-upload-btn">
                    Subir
                    <input className="admin-file-input" type="file" accept="image/*" onChange={(event) => onColorUpload(row.id, event.target.files?.[0] || null)} />
                  </label>
                  <button className="btn btn-secondary" type="button" onClick={() => onColorDetach(row.id)}>Quitar</button>
                  <button className="btn btn-ghost" type="button" onClick={() => onColorDeleteFile(row.id)}>Eliminar archivo</button>
                  <button className="btn btn-ghost" type="button" onClick={() => onRemoveColorRow(row.id)}>Eliminar color</button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" type="button" onClick={onAddColorRow}>Agregar color</button>
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
          <button className="btn btn-primary" type="submit" disabled={saving || uploading}>{saving ? 'Guardando...' : editing ? 'Actualizar producto' : 'Crear producto'}</button>
          {editing ? <button className="btn btn-secondary" type="button" onClick={onReset}>Cancelar edición</button> : null}
        </div>
      </form>
    </section>
  );
}
