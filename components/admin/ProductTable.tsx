import { Product } from '@/lib/shop';
import { formatPrice } from '@/lib/shop';

type Props = {
  products: Product[];
  loading: boolean;
  canDelete: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
};

export function ProductTable({ products, loading, canDelete, onEdit, onDelete }: Props) {
  return (
    <section className="panel admin-list-panel">
      <h2>Productos ({products.length})</h2>
      {loading ? (
        <p>Cargando productos...</p>
      ) : !products.length ? (
        <p>No hay productos para mostrar.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.imagen ? (
                      <img className="admin-thumb" src={product.imagen} alt={product.nombre} />
                    ) : (
                      <span className="admin-thumb admin-thumb--empty">Sin imagen</span>
                    )}
                  </td>
                  <td>{product.nombre}</td>
                  <td>{product.categoria}</td>
                  <td>{formatPrice(product.precio)}</td>
                  <td>{product.disponible ? 'Disponible' : 'No disponible'}</td>
                  <td className="admin-row-actions">
                    <button className="btn btn-secondary" type="button" onClick={() => onEdit(product)}>
                      Editar
                    </button>
                    {canDelete ? (
                      <button className="btn btn-ghost" type="button" onClick={() => onDelete(product.id)}>
                        Eliminar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
