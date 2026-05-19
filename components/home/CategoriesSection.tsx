import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { prisma } from '@/lib/prisma';
import { CategoryCardAnimated } from './CategoryCardAnimated';

async function getLandingCategories() {
  try {
    return await prisma.landingCategory.findMany({
      where: { activo: true },
      orderBy: { order: 'asc' },
    });
  } catch {
    return [];
  }
}

export async function CategoriesSection() {
  const categories = await getLandingCategories();

  return (
    <section className="section section--categories">
      <div className="container">
        <CategoryCardAnimated>
          <span className="section-kicker">Categorías destacadas</span>
          <h2 className="section-title">Diseños que representan lo que te gusta</h2>
          <p className="section-subtitle">
            Explorá nuestras colecciones y encontrá el diseño que más te representa.
          </p>
        </CategoryCardAnimated>

        <CategoryCardAnimated stagger>
          {categories.map((category) => (
            <div key={category.id} className="category-card-shell">
              <Link
                className="category-card"
                href={`/productos?categoria=${category.slug}`}
                aria-label={`Explorar categoría ${category.title}`}
                style={{ '--category-image': `url('${category.image}')` } as CSSProperties}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.title}
                    width={1100}
                    height={820}
                    quality={92}
                    sizes="(max-width: 767px) 92vw, (max-width: 1199px) 44vw, 420px"
                  />
                ) : null}

                <div className="category-card-content">
                  <h3>{category.title}</h3>
                  {category.description ? <p>{category.description}</p> : null}
                </div>

                <span className="btn btn-explore" aria-hidden="true">
                  Explorar
                </span>
              </Link>
            </div>
          ))}
        </CategoryCardAnimated>
      </div>
    </section>
  );
}
