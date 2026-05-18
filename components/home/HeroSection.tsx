'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DEFAULT_SITE_CONTENT, type SiteContentData } from '@/lib/site-content-defaults';

type Props = {
  content?: SiteContentData | null;
};

export function HeroSection({ content }: Props) {
  const hero = content || DEFAULT_SITE_CONTENT;

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {hero.heroEyebrow}
          </motion.span>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          >
            {hero.heroTitlePrefix} <span>{hero.heroTitleAccent}</span>, {hero.heroTitleSuffix}
          </motion.h1>

          <motion.p
            className="hero-text"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          >
            {hero.heroText}
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          >
            <Link className="btn btn-primary" href={hero.heroPrimaryButtonHref || '/catalogo'}>
              {hero.heroPrimaryButtonText}
            </Link>
            <Link className="btn btn-secondary" href={hero.heroSecondaryButtonHref || '/carrito'}>
              {hero.heroSecondaryButtonText}
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 36, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
        >
          <div className="poster-stack">
            <article className="poster-main poster-frame poster-frame--featured">
              <Image src={hero.heroMainImage} alt={hero.heroMainImageAlt} width={1100} height={1320} quality={92} sizes="(max-width: 767px) 72vw, (max-width: 1199px) 38vw, 430px" priority />
              <div className="poster-badge">{hero.heroBadgeText}</div>
            </article>

            <div className="poster-side" aria-label="Diseños destacados">
              <article className="poster-main poster-frame">
                <Image src={hero.heroSideImageOne} alt={hero.heroSideImageOneAlt} width={1100} height={1320} quality={92} sizes="(max-width: 767px) 34vw, (max-width: 1199px) 18vw, 210px" />
              </article>

              <article className="poster-main poster-frame">
                <Image src={hero.heroSideImageTwo} alt={hero.heroSideImageTwoAlt} width={1100} height={1320} quality={92} sizes="(max-width: 767px) 34vw, (max-width: 1199px) 18vw, 210px" priority />
              </article>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
