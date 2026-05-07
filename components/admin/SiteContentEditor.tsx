'use client';

import Image from 'next/image';
import { FormEvent } from 'react';
import { SiteContentErrors, SiteContentFormState } from './types';

type ImageField = 'heroMainImage' | 'heroSideImageOne' | 'heroSideImageTwo';

type Props = {
  form: SiteContentFormState;
  errors: SiteContentErrors;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  requestError: string;
  onChange: (patch: Partial<SiteContentFormState>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReload: () => void;
  onImageUpload: (field: ImageField, file: File | null) => void;
  onImageDetach: (field: ImageField) => void;
  onImageDeleteFile: (field: ImageField) => void;
};

const IMAGE_FIELDS: Array<{
  field: ImageField;
  altField: keyof SiteContentFormState;
  title: string;
  help: string;
}> = [
  {
    field: 'heroMainImage',
    altField: 'heroMainImageAlt',
    title: 'Imagen principal del hero',
    help: 'Es la imagen grande del collage. Recomendado: vertical, buena resolución.',
  },
  {
    field: 'heroSideImageOne',
    altField: 'heroSideImageOneAlt',
    title: 'Poster secundario superior',
    help: 'Primera imagen chica del stack lateral.',
  },
  {
    field: 'heroSideImageTwo',
    altField: 'heroSideImageTwoAlt',
    title: 'Poster secundario inferior',
    help: 'Segunda imagen chica del stack lateral.',
  },
];

export function SiteContentEditor({
  form,
  errors,
  loading,
  saving,
  uploading,
  requestError,
  onChange,
  onSubmit,
  onReload,
  onImageUpload,
  onImageDetach,
  onImageDeleteFile,
}: Props) {
  const disabled = loading || saving || uploading;

  return (
    <form className="admin-form-panel admin-visual-content" onSubmit={onSubmit}>
      <div className="admin-form-header">
        <div>
          <span className="admin-panel-eyebrow">Contenido visual</span>
          <h2>PromoBar y Hero</h2>
          <p className="admin-muted">Editá el contenido principal del home sin tocar código. Si algo queda vacío, se conserva el diseño actual.</p>
        </div>
        <div className="admin-form-actions admin-form-actions--top">
          <button className="btn btn-secondary" type="button" disabled={disabled} onClick={onReload}>
            Recargar
          </button>
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            {saving ? 'Guardando...' : 'Guardar contenido'}
          </button>
        </div>
      </div>

      {requestError ? <p className="form-error admin-request-error">{requestError}</p> : null}

      <section className="form-section admin-content-section">
        <div className="admin-content-section-head">
          <div>
            <h3>PromoBar</h3>
            <p className="admin-help">Mensaje superior animado. Podés pausarlo desactivándolo sin borrar el texto.</p>
          </div>
          <label className="admin-toggle-row">
            <input type="checkbox" checked={form.promoEnabled} disabled={disabled} onChange={(event) => onChange({ promoEnabled: event.target.checked })} />
            <span>PromoBar activa</span>
          </label>
        </div>

        <div className="admin-form-grid two-cols">
          <label>
            Texto de PromoBar
            <input className="input" value={form.promoText} disabled={disabled} maxLength={140} onChange={(event) => onChange({ promoText: event.target.value })} />
            {errors.promoText ? <span className="form-error">{errors.promoText}</span> : null}
          </label>
          <label>
            Link opcional
            <input className="input" placeholder="/catalogo o vacío" value={form.promoHref} disabled={disabled} onChange={(event) => onChange({ promoHref: event.target.value })} />
            {errors.promoHref ? <span className="form-error">{errors.promoHref}</span> : null}
          </label>
        </div>
      </section>

      <section className="form-section admin-content-section">
        <div className="admin-content-section-head">
          <div>
            <h3>Texto del Hero</h3>
            <p className="admin-help">El título se divide en tres partes para conservar el destacado amarillo del diseño.</p>
          </div>
        </div>

        <div className="admin-form-grid two-cols">
          <label>
            Eyebrow
            <input className="input" value={form.heroEyebrow} disabled={disabled} onChange={(event) => onChange({ heroEyebrow: event.target.value })} />
            {errors.heroEyebrow ? <span className="form-error">{errors.heroEyebrow}</span> : null}
          </label>
          <label>
            Palabra destacada
            <input className="input" value={form.heroTitleAccent} disabled={disabled} onChange={(event) => onChange({ heroTitleAccent: event.target.value })} />
            {errors.heroTitleAccent ? <span className="form-error">{errors.heroTitleAccent}</span> : null}
          </label>
          <label>
            Inicio del título
            <input className="input" value={form.heroTitlePrefix} disabled={disabled} onChange={(event) => onChange({ heroTitlePrefix: event.target.value })} />
            {errors.heroTitlePrefix ? <span className="form-error">{errors.heroTitlePrefix}</span> : null}
          </label>
          <label>
            Cierre del título
            <input className="input" value={form.heroTitleSuffix} disabled={disabled} onChange={(event) => onChange({ heroTitleSuffix: event.target.value })} />
            {errors.heroTitleSuffix ? <span className="form-error">{errors.heroTitleSuffix}</span> : null}
          </label>
        </div>

        <label>
          Texto descriptivo
          <textarea className="input" rows={4} value={form.heroText} disabled={disabled} onChange={(event) => onChange({ heroText: event.target.value })} />
          {errors.heroText ? <span className="form-error">{errors.heroText}</span> : null}
        </label>
      </section>

      <section className="form-section admin-content-section">
        <div className="admin-content-section-head">
          <div>
            <h3>Botones del Hero</h3>
            <p className="admin-help">Usá links internos como /catalogo, /carrito o anclas como #como-comprar.</p>
          </div>
        </div>

        <div className="admin-form-grid two-cols">
          <label>
            Texto botón principal
            <input className="input" value={form.heroPrimaryButtonText} disabled={disabled} onChange={(event) => onChange({ heroPrimaryButtonText: event.target.value })} />
            {errors.heroPrimaryButtonText ? <span className="form-error">{errors.heroPrimaryButtonText}</span> : null}
          </label>
          <label>
            Link botón principal
            <input className="input" value={form.heroPrimaryButtonHref} disabled={disabled} onChange={(event) => onChange({ heroPrimaryButtonHref: event.target.value })} />
            {errors.heroPrimaryButtonHref ? <span className="form-error">{errors.heroPrimaryButtonHref}</span> : null}
          </label>
          <label>
            Texto botón secundario
            <input className="input" value={form.heroSecondaryButtonText} disabled={disabled} onChange={(event) => onChange({ heroSecondaryButtonText: event.target.value })} />
            {errors.heroSecondaryButtonText ? <span className="form-error">{errors.heroSecondaryButtonText}</span> : null}
          </label>
          <label>
            Link botón secundario
            <input className="input" value={form.heroSecondaryButtonHref} disabled={disabled} onChange={(event) => onChange({ heroSecondaryButtonHref: event.target.value })} />
            {errors.heroSecondaryButtonHref ? <span className="form-error">{errors.heroSecondaryButtonHref}</span> : null}
          </label>
        </div>
      </section>

      <section className="form-section admin-content-section">
        <div className="admin-content-section-head">
          <div>
            <h3>Imágenes del Hero</h3>
            <p className="admin-help">Las imágenes subidas se guardan en uploads/home y se reutilizan en el home público.</p>
          </div>
        </div>

        <div className="admin-visual-images-grid">
          {IMAGE_FIELDS.map((item) => {
            const value = String(form[item.field] || '');
            return (
              <article className="admin-visual-image-card" key={item.field}>
                <div>
                  <strong>{item.title}</strong>
                  <p className="admin-help">{item.help}</p>
                </div>

                <div className="admin-visual-image-preview">
                  {value ? <Image src={value} alt="Preview imagen hero" width={220} height={260} quality={90} /> : <span>Sin imagen</span>}
                </div>

                <label>
                  Ruta de imagen
                  <input className="input" value={value} disabled={disabled} onChange={(event) => onChange({ [item.field]: event.target.value })} />
                  {errors[item.field] ? <span className="form-error">{errors[item.field]}</span> : null}
                </label>

                <label>
                  Texto alternativo
                  <input className="input" value={String(form[item.altField] || '')} disabled={disabled} onChange={(event) => onChange({ [item.altField]: event.target.value })} />
                  {errors[item.altField] ? <span className="form-error">{errors[item.altField]}</span> : null}
                </label>

                <div className="admin-visual-image-actions">
                  <label className="btn btn-secondary admin-file-btn">
                    Subir imagen
                    <input type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled} onChange={(event) => onImageUpload(item.field, event.target.files?.[0] || null)} />
                  </label>
                  <button className="btn btn-ghost" type="button" disabled={disabled || !value} onClick={() => onImageDetach(item.field)}>
                    Quitar
                  </button>
                  <button className="btn btn-danger" type="button" disabled={disabled || !value || !value.startsWith('/uploads/home/')} onClick={() => onImageDeleteFile(item.field)}>
                    Eliminar archivo
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <label>
          Badge sobre imagen principal
          <input className="input" value={form.heroBadgeText} disabled={disabled} onChange={(event) => onChange({ heroBadgeText: event.target.value })} />
          {errors.heroBadgeText ? <span className="form-error">{errors.heroBadgeText}</span> : null}
        </label>
      </section>

      <div className="admin-form-actions">
        <button className="btn btn-secondary" type="button" disabled={disabled} onClick={onReload}>
          Descartar cambios
        </button>
        <button className="btn btn-primary" type="submit" disabled={disabled}>
          {saving ? 'Guardando...' : 'Guardar contenido visual'}
        </button>
      </div>
    </form>
  );
}
