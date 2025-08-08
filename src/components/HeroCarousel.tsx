import React, { useEffect, useMemo, useState } from 'react';

interface HeroCarouselProps {
  images: { url: string; alt?: string }[];
  title: string;
  subtitle?: string;
  intervalMs?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  title,
  subtitle,
  intervalMs = 5000,
}) => {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const safeImages = useMemo(() => images.filter(Boolean), [images]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, total]);

  const goTo = (index: number) => {
    if (total === 0) return;
    setCurrent(((index % total) + total) % total);
  };

  const goPrev = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  return (
    <section className="relative overflow-hidden rounded-2xl h-56 sm:h-64 md:h-72 lg:h-80">
      {/* Slides */}
      <div className="absolute inset-0">
        {safeImages.map((img, idx) => (
          <img
            key={img.url + idx}
            src={img.url}
            alt={img.alt || `Banner ${idx + 1}`}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Texto e overlay removidos conforme solicitado */}

      {/* Controles */}
      {total > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            aria-label="Anterior"
            onClick={goPrev}
            className="h-8 w-8 rounded-full bg-background/80 text-foreground hover:opacity-90 shadow-soft grid place-items-center"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {safeImages.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir para slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  i === current ? 'bg-background/90' : 'bg-background/50'
                }`}
              />
            ))}
          </div>
          <button
            aria-label="Próximo"
            onClick={goNext}
            className="h-8 w-8 rounded-full bg-background/80 text-foreground hover:opacity-90 shadow-soft grid place-items-center"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
};


