type SectionWaveProps = {
  variant?: 'categories' | 'steps' | 'featured';
  flip?: boolean;
};

export function SectionWave({ variant = 'categories', flip = false }: SectionWaveProps) {
  return (
    <div
      className={`landing-wave landing-wave--${variant}${flip ? ' landing-wave--flip' : ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 132" preserveAspectRatio="none" focusable="false">
        <path
          className="landing-wave__main"
          d="M0 72L60 63.5C120 55 240 38 360 45.2C480 52 600 84 720 88.8C840 94 960 72 1080 54.2C1200 36 1320 22 1380 15L1440 8V132H1380C1320 132 1200 132 1080 132C960 132 840 132 720 132C600 132 480 132 360 132C240 132 120 132 60 132H0V72Z"
        />
        <path
          className="landing-wave__accent"
          d="M0 96L80 84.8C160 74 320 52 480 64.5C640 77 800 124 960 116.5C1120 109 1280 47 1360 16.2L1440 -14V48L1360 64.8C1280 82 1120 114 960 120.8C800 128 640 108 480 91.2C320 74 160 60 80 53.2L0 46V96Z"
        />
      </svg>
    </div>
  );
}
