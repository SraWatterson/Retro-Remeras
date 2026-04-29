'use client';

import { FormEvent, useMemo, useState } from 'react';

type Props = {
  categories: string[];
  loading: boolean;
  canManage: boolean;
  onRename: (from: string, to: string) => Promise<void> | void;
  onDelete: (category: string) => Promise<void> | void;
};

function normalizeCategory(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function uniqueCategories(categories: string[]) {
  const seen = new Set<string>();

  return categories
    .map(normalizeCategory)
    .filter(Boolean)
    .filter((category) => {
      const key = category.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b, 'es'));
}

export function CategoryManager({ categories, loading, canManage, onRename, onDelete }: Props) {
  const items = useMemo(() => uniqueCategories(categories), [categories]);
  const [editingCategory, setEditingCategory] = useState('');
  const [draftName, setDraftName] = useState('');
  const [busyCategory, setBusyCategory] = useState('');
  const [error, setError] = useState('');

  function startEditing(category: string) {
    setError('');
    setEditingCategory(category);
    setDraftName(category);
  }

  function cancelEditing() {
    setError('');
    setEditingCategory('');
    setDraftName('');
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextName = normalizeCategory(draftName);
    if (!nextName || nextName.length < 2) {
      setError('La categoría debe tener al menos 2 caracteres.');
      return;
    }

    if (nextName.length > 60) {
      setError('La categoría no puede superar los 60 caracteres.');
      return;
    }

    setBusyCategory(editingCategory);
    setError('');

    try {
      await onRename(editingCategory, nextName);
      cancelEditing();
    } finally {
      setBusyCategory('');
    }
  }

  async function handleDelete(category: string) {
    const confirmed = confirm(
      `¿Eliminar la categoría "${category}"?\n\nLos productos que la usan se moverán a "Variados". Esta acción no elimina productos.`
    );

    if (!confirmed) return;

    setBusyCategory(category);
    setError('');

    try {
      await onDelete(category);
      if (editingCategory === category) {
        cancelEditing();
      }
    } finally {
      setBusyCategory('');
    }
  }

  return (
    <section className="panel admin-category-manager" aria-label="Gestión de categorías">
      <div className="admin-category-manager__header">
        <div>
          <span className="admin-panel-eyebrow">Categorías</span>
          <h2>Gestionar categorías</h2>
          <p className="admin-muted">
            Corregí errores de tipeo o eliminá categorías que ya no quieras usar. No borra productos.
          </p>
        </div>
      </div>

      {!canManage ? (
        <div className="admin-empty-state">
          <h3>Solo administradores</h3>
          <p>Tu rol actual puede gestionar productos, pero no editar categorías globales.</p>
        </div>
      ) : loading ? (
        <div className="admin-skeleton-list" aria-label="Cargando categorías">
          <div className="admin-skeleton-row" />
          <div className="admin-skeleton-row" />
        </div>
      ) : !items.length ? (
        <div className="admin-empty-state">
          <h3>No hay categorías todavía</h3>
          <p>Creá una categoría desde el formulario de producto.</p>
        </div>
      ) : (
        <div className="admin-category-list">
          {items.map((category) => {
            const isEditing = editingCategory === category;
            const isBusy = busyCategory === category;
            const isFallback = category.toLowerCase() === 'variados';

            return (
              <div className="admin-category-item" key={category}>
                {isEditing ? (
                  <form className="admin-category-edit" onSubmit={handleRename}>
                    <label className="sr-only" htmlFor="admin-category-name">Nuevo nombre de categoría</label>
                    <input
                      id="admin-category-name"
                      className="input"
                      value={draftName}
                      onChange={(event) => setDraftName(event.target.value)}
                      disabled={isBusy}
                      autoFocus
                    />
                    <button className="btn btn-primary" type="submit" disabled={isBusy}>
                      {isBusy ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button className="btn btn-secondary" type="button" disabled={isBusy} onClick={cancelEditing}>
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="admin-category-name">{category}</span>
                    <div className="admin-category-actions">
                      <button className="btn btn-secondary" type="button" disabled={isBusy} onClick={() => startEditing(category)}>
                        Editar
                      </button>
                      <button
                        className="btn admin-danger-btn"
                        type="button"
                        disabled={isBusy || isFallback}
                        title={isFallback ? 'Variados se usa como categoría de respaldo' : undefined}
                        onClick={() => void handleDelete(category)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error ? <p className="admin-error">{error}</p> : null}
    </section>
  );
}
