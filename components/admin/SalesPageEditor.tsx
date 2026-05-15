'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import type { SalesItem, SalesPageContent } from '@/lib/site-content-defaults';
import { DEFAULT_MAYORISTA, DEFAULT_PERSONALIZADOS } from '@/lib/site-content-defaults';

type Props = {
  page: 'personalizados' | 'mayorista';
};

const DEFAULTS: Record<'personalizados' | 'mayorista', SalesPageContent> = {
  personalizados: DEFAULT_PERSONALIZADOS,
  mayorista: DEFAULT_MAYORISTA,
};

const PAGE_LABEL: Record<'personalizados' | 'mayorista', string> = {
  personalizados: 'Personalizados',
  mayorista: 'Mayorista',
};

const API_KEY: Record<'personalizados' | 'mayorista', string> = {
  personalizados: 'personalizadosData',
  mayorista: 'mayoristaData',
};

export function SalesPageEditor({ page }: Props) {
  const [form, setForm] = useState<SalesPageContent>(DEFAULTS[page]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/site-content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.[API_KEY[page]]) setForm(data[API_KEY[page]] as SalesPageContent);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [page]);

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('context', 'pages');
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json() as { url?: string; path?: string };
    return data.url ?? data.path ?? null;
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setForm((prev) => ({ ...prev, image: url }));
    setUploading(false);
    e.target.value = '';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch('/api/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [API_KEY[page]]: form }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error || 'Error al guardar');
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function patchItem<K extends 'benefits' | 'process'>(
    key: K,
    index: number,
    patch: Partial<SalesItem>
  ) {
    setForm((prev) => {
      const list = [...prev[key]];
      list[index] = { ...list[index], ...patch };
      return { ...prev, [key]: list };
    });
  }

  function addItem(key: 'benefits' | 'process') {
    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], { title: '', text: '' }],
    }));
  }

  function removeItem(key: 'benefits' | 'process', index: number) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  }

  const disabled = loading || saving || uploading;

  return (
    <form className="admin-form-panel admin-sales-editor" onSubmit={(e) => void handleSubmit(e)}>
      <div className="admin-form-header">
        <div>
          <span className="admin-panel-eyebrow">Página</span>
          <h2>{PAGE_LABEL[page]}</h2>
          <p className="admin-muted">Editá el contenido de la página sin tocar código. Los cambios se ven al recargar la página pública.</p>
        </div>
        <div className="admin-form-actions admin-form-actions--top">
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            {saving ? 'Guardando...' : success ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {error ? <p className="admin-request-error">{error}</p> : null}
      {loading ? <p className="admin-muted" style={{ padding: '2rem 0' }}>Cargando…</p> : null}

      {!loading ? (
        <>
          {/* Hero */}
          <fieldset className="admin-fieldset">
            <legend>Hero</legend>
            <div className="admin-field-grid">
              <div className="form-group">
                <label className="form-label">Kicker (eyebrow)</label>
                <input className="input" value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} maxLength={60} required />
              </div>
              <div className="form-group">
                <label className="form-label">Título principal</label>
                <input className="input" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} maxLength={80} required />
              </div>
              <div className="form-group">
                <label className="form-label">Palabra destacada (acento)</label>
                <input className="input" value={form.highlight} onChange={(e) => setForm((p) => ({ ...p, highlight: e.target.value }))} maxLength={60} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Descripción</label>
                <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} maxLength={400} required />
              </div>
              <div className="form-group">
                <label className="form-label">Texto del botón principal (WhatsApp)</label>
                <input className="input" value={form.primaryCta} onChange={(e) => setForm((p) => ({ ...p, primaryCta: e.target.value }))} maxLength={60} required />
              </div>
              <div className="form-group">
                <label className="form-label">Texto del botón secundario</label>
                <input className="input" value={form.secondaryCta} onChange={(e) => setForm((p) => ({ ...p, secondaryCta: e.target.value }))} maxLength={60} required />
              </div>
            </div>

            <div className="admin-image-field">
              <p className="form-label">Imagen del hero</p>
              {form.image ? (
                <div className="admin-image-preview">
                  <Image src={form.image} alt={form.imageAlt || 'Preview'} width={120} height={144} style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  <div className="admin-image-preview__meta">
                    <span className="admin-muted" style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>{form.image}</span>
                  </div>
                </div>
              ) : null}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input className="input" value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} placeholder="Ruta o URL de imagen" />
                <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => imageRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Subiendo…' : 'Subir imagen'}
                </button>
                <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageChange} />
              </div>
              <div className="form-group" style={{ marginTop: '0.4rem' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Texto alternativo (alt)</label>
                <input className="input" value={form.imageAlt} onChange={(e) => setForm((p) => ({ ...p, imageAlt: e.target.value }))} maxLength={100} />
              </div>
            </div>
          </fieldset>

          {/* Beneficios */}
          <fieldset className="admin-fieldset">
            <legend>Beneficios</legend>
            <div className="form-group">
              <label className="form-label">Título de la sección</label>
              <input className="input" value={form.benefitsTitle} onChange={(e) => setForm((p) => ({ ...p, benefitsTitle: e.target.value }))} maxLength={100} required />
            </div>
            <div className="admin-items-list">
              {form.benefits.map((item, idx) => (
                <div key={idx} className="admin-item-row">
                  <span className="admin-item-index">{idx + 1}</span>
                  <div className="admin-item-fields">
                    <input className="input" value={item.title} onChange={(e) => patchItem('benefits', idx, { title: e.target.value })} placeholder="Título" maxLength={80} required />
                    <input className="input" value={item.text} onChange={(e) => patchItem('benefits', idx, { text: e.target.value })} placeholder="Descripción" maxLength={300} required />
                  </div>
                  <button type="button" className="btn btn-danger admin-item-remove" onClick={() => removeItem('benefits', idx)} disabled={form.benefits.length <= 1} title="Eliminar">✕</button>
                </div>
              ))}
            </div>
            {form.benefits.length < 6 ? (
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem', marginTop: '0.5rem' }} onClick={() => addItem('benefits')}>+ Agregar beneficio</button>
            ) : null}
          </fieldset>

          {/* Proceso */}
          <fieldset className="admin-fieldset">
            <legend>Proceso</legend>
            <div className="form-group">
              <label className="form-label">Título de la sección</label>
              <input className="input" value={form.processTitle} onChange={(e) => setForm((p) => ({ ...p, processTitle: e.target.value }))} maxLength={100} required />
            </div>
            <div className="admin-items-list">
              {form.process.map((item, idx) => (
                <div key={idx} className="admin-item-row">
                  <span className="admin-item-index">{idx + 1}</span>
                  <div className="admin-item-fields">
                    <input className="input" value={item.title} onChange={(e) => patchItem('process', idx, { title: e.target.value })} placeholder="Título del paso" maxLength={80} required />
                    <input className="input" value={item.text} onChange={(e) => patchItem('process', idx, { text: e.target.value })} placeholder="Descripción" maxLength={300} required />
                  </div>
                  <button type="button" className="btn btn-danger admin-item-remove" onClick={() => removeItem('process', idx)} disabled={form.process.length <= 1} title="Eliminar">✕</button>
                </div>
              ))}
            </div>
            {form.process.length < 6 ? (
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem', marginTop: '0.5rem' }} onClick={() => addItem('process')}>+ Agregar paso</button>
            ) : null}
          </fieldset>

          {/* CTA final */}
          <fieldset className="admin-fieldset">
            <legend>CTA final</legend>
            <div className="admin-field-grid">
              <div className="form-group">
                <label className="form-label">Kicker (nota)</label>
                <input className="input" value={form.noteTitle} onChange={(e) => setForm((p) => ({ ...p, noteTitle: e.target.value }))} maxLength={80} required />
              </div>
              <div className="form-group">
                <label className="form-label">Texto de cierre</label>
                <input className="input" value={form.noteText} onChange={(e) => setForm((p) => ({ ...p, noteText: e.target.value }))} maxLength={300} required />
              </div>
            </div>
          </fieldset>

          <div className="admin-form-footer">
            <button className="btn btn-primary" type="submit" disabled={disabled}>
              {saving ? 'Guardando...' : success ? '✓ Guardado' : 'Guardar cambios'}
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}
