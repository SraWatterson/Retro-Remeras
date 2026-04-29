'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import styles from './FloatingBackButton.module.css';

function shouldShowBackButton(pathname: string) {
  if (pathname === '/') return false;
  if (pathname.startsWith('/admin')) return false;
  if (pathname.startsWith('/login')) return false;

  return true;
}

export function FloatingBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const showButton = shouldShowBackButton(pathname);

  function handleClick() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  }

  return (
    <AnimatePresence>
      {showButton ? (
        <motion.button
          type="button"
          className={styles.floatingBackButton}
          onClick={handleClick}
          aria-label="Volver atrás"
          title="Volver atrás"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -12, y: 8, scale: 0.96 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, x: -12, y: 8, scale: 0.96 }}
          whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15.5 5.25 8.75 12l6.75 6.75" />
          </svg>
          <span className={styles.text}>Volver</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}