import { prisma } from '@/lib/prisma';
import { CategoryCardAnimated } from './CategoryCardAnimated';
import { CategoryMarquee } from './CategoryMarquee';

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

        <CategoryMarquee
          categories={categories.map((category) => ({
            id: category.id,
            title: category.title,
            slug: category.slug,
            description: category.description,
            image: category.image,
          }))}
        />
      </div>
    </section>
  );
}
