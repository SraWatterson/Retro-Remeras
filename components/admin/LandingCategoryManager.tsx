'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';

export type LandingCategoryItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  activo: boolean;
};

type Props = {
  initialCategories: LandingCategoryItem[];
};

type Draft = {
  title: string;
  slug: string;
  description: string;
  image: string;
};

const EMPTY_DRAFT: Draft = { title: '', slug: '', description: '', image: '' };

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function LandingCategoryManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<LandingCategoryItem[]>(initialCategories);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<'new' | string | null>(null);
  const [error, setError] = useState('');
  const newImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File, context: string): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('context', context);
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    if (!res.ok) return null;
    const data = await res.json() as { url: string };
    return data.url;
  }

  async function handleNewImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor('new');
    const url = await uploadImage(file, 'categories');
    if (url) setDraft((prev) => ({ ...prev, image: url }));
    setUploadingFor(null);
    e.target.value = '';
  }

  async function handleEditImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    setUploadingFor(editingId);
    const url = await uploadImage(file, 'categories');
    if (url) setEditDraft((prev) => ({ ...prev, image: url }));
    setUploadingFor(null);
    e.target.value = '';
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) { setError('El título es requerido'); return; }
    setError('');
    setBusy(true);
    try {
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.order), -1);
      const payload = { ...draft, slug: draft.slug || toSlug(draft.title), order: maxOrder + 1, activo: true };
      const res = await fetch('/api/landing-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error || 'Error al crear'); return; }
      const created = await res.json() as LandingCategoryItem;
      setCategories((prev) => [...prev, created]);
      setDraft(EMPTY_DRAFT);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(cat: LandingCategoryItem) {
    setEditingId(cat.id);
    setEditDraft({ title: cat.title, slug: cat.slug, description: cat.description, image: cat.image });
    setError('');
  }

  async function saveEdit(id: string) {
    if (!editDraft.title.trim()) { setError('El título es requerido'); return; }
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/landing-categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editDraft),
      });
      if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error || 'Error al guardar'); return; }
      const updated = await res.json() as LandingCategoryItem;
      setCategories((prev) => prev.map((c) => c.id === id ? updated : c));
      setEditingId(null);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActivo(cat: LandingCategoryItem) {
    setBusy(true);
    try {
      const res = await fetch(`/api/landing-categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !cat.activo }),
      });
      if (!res.ok) return;
      const updated = await res.json() as LandingCategoryItem;
      setCategories((prev) => prev.map((c) => c.id === cat.id ? updated : c));
    } finally {
      setBusy(false);
    }
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const a = categories[idx];
    const b = categories[swapIdx];
    setBusy(true);
    try {
      await Promise.all([
        fetch(`/api/landing-categories/${a.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: b.order }) }),
        fetch(`/api/landing-categories/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: a.order }) }),
      ]);
      setCategories((prev) => {
        const next = [...prev];
        const ai = next.findIndex((c) => c.id === a.id);
        const bi = next.findIndex((c) => c.id === b.id);
        [next[ai], next[bi]] = [{ ...next[ai], order: b.order }, { ...next[bi], order: a.order }];
        return [...next].sort((x, y) => x.order - y.order);
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar esta categoría de la landing? Los productos no se verán afectados.')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/landing-categories/${id}`, { method: 'DELETE' });
      if (!res.ok) { setError('Error al eliminar'); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="landing-cat-manager">
      <div className="section-header" style={{ marginBottom: '1.6rem' }}>
        <span className="section-kicker">Administración</span>
        <h2 className="section-title" style={{ fontSize: '1.4rem' }}>Cards de categorías — Landing</h2>
        <p className="section-subtitle" style={{ fontSize: '0.9rem' }}>
          Cada card aparece en la sección de categorías de la página principal. El orden se guarda automáticamente.
        </p>
      </div>

      {error ? <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p> : null}

      {/* Lista */}
      <div className="landing-cat-list">
        {categories.length === 0 && (
          <p style={{ color: 'rgba(241,221,178,0.5)', fontSize: '0.9rem' }}>No hay categorías. Creá la primera.</p>
        )}
        {categories.map((cat, idx) => (
          <div key={cat.id} className={`landing-cat-row${!cat.activo ? ' is-inactive' : ''}`}>
            <div className="landing-cat-row__order">
              <button type="button" className="order-btn" onClick={() => void moveOrder(cat.id, 'up')} disabled={busy || idx === 0} aria-label="Subir">▲</button>
              <button type="button" className="order-btn" onClick={() => void moveOrder(cat.id, 'down')} disabled={busy || idx === categories.length - 1} aria-label="Bajar">▼</button>
            </div>

            {cat.image ? (
              <div className="landing-cat-row__thumb">
                <Image src={cat.image} alt={cat.title} width={56} height={56} style={{ objectFit: 'cover', borderRadius: '8px', width: 56, height: 56 }} />
              </div>
            ) : (
              <div className="landing-cat-row__thumb landing-cat-row__thumb--empty" />
            )}

            {editingId === cat.id ? (
              <div className="landing-cat-row__edit-form">
                <div className="field-row">
                  <input className="admin-input" value={editDraft.title} onChange={(e) => setEditDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Título" />
                  <input className="admin-input" value={editDraft.slug} onChange={(e) => setEditDraft((p) => ({ ...p, slug: e.target.value }))} placeholder="Slug (url)" />
                </div>
                <input className="admin-input" value={editDraft.description} onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Descripción breve" style={{ marginTop: '0.4rem' }} />
                <div className="field-row" style={{ marginTop: '0.4rem', alignItems: 'center' }}>
                  <input className="admin-input" value={editDraft.image} onChange={(e) => setEditDraft((p) => ({ ...p, image: e.target.value }))} placeholder="URL de imagen" />
                  <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => editImageRef.current?.click()} disabled={uploadingFor === cat.id}>
                    {uploadingFor === cat.id ? 'Subiendo…' : 'Subir imagen'}
                  </button>
                  <input ref={editImageRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleEditImageChange} />
                </div>
                <div className="landing-cat-row__edit-actions">
                  <button type="button" className="btn btn-primary" style={{ fontSize: '0.82rem' }} onClick={() => void saveEdit(cat.id)} disabled={busy}>Guardar</button>
                  <button type="button" className="btn btn-secondary" style={{ fontSize: '0.82rem' }} onClick={() => setEditingId(null)} disabled={busy}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="landing-cat-row__info">
                <strong>{cat.title}</strong>
                <span className="landing-cat-row__slug">/{cat.slug}</span>
                {cat.description ? <p>{cat.description}</p> : null}
              </div>
            )}

            {editingId !== cat.id ? (
              <div className="landing-cat-row__actions">
                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.78rem' }} onClick={() => startEdit(cat)} disabled={busy}>Editar</button>
                <button type="button" className={`btn ${cat.activo ? 'btn-secondary' : 'btn-primary'}`} style={{ fontSize: '0.78rem' }} onClick={() => void toggleActivo(cat)} disabled={busy}>
                  {cat.activo ? 'Ocultar' : 'Mostrar'}
                </button>
                <button type="button" className="btn btn-danger" style={{ fontSize: '0.78rem' }} onClick={() => void handleDelete(cat.id)} disabled={busy}>Eliminar</button>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Formulario nueva categoría */}
      <form className="landing-cat-new-form" onSubmit={(e) => void handleCreate(e)}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.8rem', color: 'rgba(241,221,178,0.9)' }}>Nueva categoría</h3>
        <div className="field-row">
          <input
            className="admin-input"
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value, slug: p.slug || toSlug(e.target.value) }))}
            placeholder="Título *"
            required
          />
          <input
            className="admin-input"
            value={draft.slug}
            onChange={(e) => setDraft((p) => ({ ...p, slug: toSlug(e.target.value) }))}
            placeholder="Slug (se genera automático)"
          />
        </div>
        <input
          className="admin-input"
          value={draft.description}
          onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
          placeholder="Descripción breve"
          style={{ marginTop: '0.5rem', width: '100%' }}
        />
        <div className="field-row" style={{ marginTop: '0.5rem', alignItems: 'center' }}>
          <input
            className="admin-input"
            value={draft.image}
            onChange={(e) => setDraft((p) => ({ ...p, image: e.target.value }))}
            placeholder="URL de imagen"
          />
          <button type="button" className="btn btn-secondary" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }} onClick={() => newImageRef.current?.click()} disabled={uploadingFor === 'new'}>
            {uploadingFor === 'new' ? 'Subiendo…' : 'Subir imagen'}
          </button>
          <input ref={newImageRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleNewImageChange} />
        </div>
        {draft.image ? (
          <div style={{ marginTop: '0.5rem' }}>
            <Image src={draft.image} alt="Preview" width={80} height={60} style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(216,148,37,0.3)' }} />
          </div>
        ) : null}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.8rem', fontSize: '0.88rem' }} disabled={busy || uploadingFor !== null}>
          {busy ? 'Creando…' : '+ Agregar categoría'}
        </button>
      </form>
    </div>
  );
}
