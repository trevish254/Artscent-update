import React, { useEffect, useRef, useState } from 'react';

// Constants
const TEXT_COLOR = '#121212';
const BG_BLUE = '#F2F1ED';
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Animation Helper
function anim(visible: boolean, delay: number, opts: { y?: number; x?: number; duration?: number } = {}) {
  const { y = 20, x = 0, duration = 1600 } = opts;
  const translateFrom = y !== 0 ? `translateY(${y}px)` : x !== 0 ? `translateX(${x}px)` : 'none';
  return {
    style: {
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0,0)' : translateFrom,
      transition: `opacity ${duration}ms ${EASE} ${delay}ms, transform ${duration}ms ${EASE} ${delay}ms`,
    } as React.CSSProperties,
  };
}

// Product Data
const SCENT_PRODUCT = {
  name: 'Eau So Sweet',
  size: '100 ml / 3.3 oz',
  image:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260511_151640_5b4a7bf8-4eb2-4a49-aa63-17a9bb642b88.png&w=1280&q=85',
  notes: [
    { label: 'Fruity top', ingredient: 'WHITE RASPBERRIES' },
    { label: 'Floral heart', ingredient: 'DAISY TREE PETALS' },
    { label: 'Feminine base', ingredient: 'SUGAR MUSKS' },
  ],
};

interface ProductPanelProps {
  bg: string;
  product: { name: string; size: string; image: string };
  notes: { label: string; ingredient: string }[];
  visible: boolean;
  noteStyle?: 'normal' | 'bold';
}

export const ProductPanel: React.FC<ProductPanelProps> = ({
  bg,
  product,
  notes,
  visible,
  noteStyle = 'normal',
}) => {
  return (
    <div
      className="relative flex flex-col px-6 md:px-8 pt-6 md:pt-8 pb-8 md:pb-10"
      style={{ backgroundColor: bg, minHeight: '100%' }}
    >
      {/* 1. Top labels row */}
      <div
        className="flex items-start justify-between mb-auto"
        {...anim(visible, 0, { y: 12, duration: 1400 })}
      >
        <span className="text-xs font-normal" style={{ color: TEXT_COLOR }}>
          {noteStyle !== 'bold' ? 'Daisy love' : 'Daisy wild'}
        </span>
        <span className="text-xs font-normal" style={{ color: TEXT_COLOR }}>
          {noteStyle !== 'bold' ? 'Sweet' : 'Playful'}
        </span>
      </div>

      {/* 2. Product image block */}
      <div
        className="flex flex-col items-center py-8"
        style={{
          flex: 1,
          justifyContent: 'center',
          ...anim(visible, 300, { y: 40, duration: 1800 }).style,
        }}
      >
        {/* Image container */}
        <div
          className="overflow-hidden"
          style={{
            width: 'clamp(140px, 40%, 220px)',
            aspectRatio: '220/340',
            backgroundColor: '#D9D9D9',
            borderRadius: '2px',
            flexShrink: 0,
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>

        {/* Caption */}
        <div className="text-center mt-4" {...anim(visible, 600, { y: 10, duration: 1400 })}>
          <p className="text-sm font-normal" style={{ color: TEXT_COLOR }}>
            {product.name}
          </p>
          <p className="text-xs font-normal mt-1" style={{ color: TEXT_COLOR }}>
            {product.size}
          </p>
        </div>
      </div>

      {/* 3. Bottom row — notes + button */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        {/* Notes column */}
        <div className="flex flex-col gap-0.5" {...anim(visible, 900, { y: 16, duration: 1400 })}>
          {notes.map((note) => (
            <div key={note.ingredient}>
              <p
                className="text-xs leading-snug"
                style={{ color: TEXT_COLOR, fontWeight: noteStyle === 'bold' ? 700 : 400 }}
              >
                {note.label}
              </p>
              <p
                className="text-xs font-bold tracking-widest uppercase leading-snug"
                style={{ color: TEXT_COLOR }}
              >
                {note.ingredient}
              </p>
            </div>
          ))}
        </div>

        {/* SHOP NOW button */}
        <button
          className="text-xs font-bold tracking-widest uppercase border px-6 py-3 relative group shrink-0"
          style={{
            color: TEXT_COLOR,
            borderColor: TEXT_COLOR,
            backgroundColor: 'transparent',
            ...anim(visible, 1150, { y: 16, duration: 1400 }).style,
          }}
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-500">
            SHOP NOW
          </span>
          <span
            className="absolute inset-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
            style={{ backgroundColor: '#ffffff' }}
          />
        </button>
      </div>
    </div>
  );
};

export const ScentFinderSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative w-full">
      <div className="flex flex-col md:grid md:min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Child 1: ProductPanel (always visible) */}
        <ProductPanel
          bg={BG_BLUE}
          product={SCENT_PRODUCT}
          notes={SCENT_PRODUCT.notes}
          visible={visible}
        />

        {/* Child 2: Desktop video panel (hidden below md) */}
        <div
          className="hidden md:block relative overflow-hidden"
          style={{ backgroundColor: '#111', minHeight: '100%' }}
        >
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source
              src="https://res.cloudinary.com/dfedn2xsg/video/upload/v1787529589/WhatsApp_Video_2026-08-24_at_2.51.19_AM_aab5vl.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Child 3: Mobile video strip (hidden at md and above) */}
        <div
          className="md:hidden relative overflow-hidden"
          style={{ height: '75vw', backgroundColor: '#111' }}
        >
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source
              src="https://res.cloudinary.com/dfedn2xsg/video/upload/v1787529589/WhatsApp_Video_2026-08-24_at_2.51.19_AM_aab5vl.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </section>
  );
};

export default ScentFinderSection;
