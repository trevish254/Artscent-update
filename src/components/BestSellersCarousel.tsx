import React, { useEffect, useRef, useState } from 'react';

export interface ProductItem {
  id: string;
  category: string;
  subcategory?: string;
  name: string;
  price: string;
  oldPrice?: string;
  image: string;
  isSet?: boolean;
}

const PRODUCTS: ProductItem[] = [
  {
    id: '1',
    category: 'ILLUMINATE',
    name: 'Illuminating cleansing gel',
    price: '36,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_193822_8c95f5ed-b142-454f-ab87-59ad1f09e758.png&w=1280&q=85',
  },
  {
    id: '2',
    category: 'UNIFY',
    subcategory: 'TIGHTEN PORES',
    name: 'Unifying serum spray',
    price: '34,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194048_278bf3cc-7d1f-43c1-9dc7-73d8fcd9949c.png&w=1280&q=85',
  },
  {
    id: '3',
    category: 'NATURAL GLOW',
    name: 'Super glow set',
    price: '92,00',
    oldPrice: '99,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194058_d89610de-05f8-45e4-8196-0680296c565a.png&w=1280&q=85',
    isSet: true,
  },
  {
    id: '4',
    category: 'PROTECT',
    subcategory: 'ILLUMINATE',
    name: 'Radiance day oil',
    price: '59,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194112_1763cbb2-3171-4ad3-9f38-1b738b8f1bb6.png&w=1280&q=85',
  },
  {
    id: '5',
    category: 'HYDRATE',
    subcategory: 'NOURISH',
    name: 'Deep moisture cream',
    price: '48,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_193822_8c95f5ed-b142-454f-ab87-59ad1f09e758.png&w=1280&q=85',
  },
  {
    id: '6',
    category: 'RENEW',
    name: 'Night repair elixir',
    price: '72,00',
    oldPrice: '79,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194048_278bf3cc-7d1f-43c1-9dc7-73d8fcd9949c.png&w=1280&q=85',
  },
  {
    id: '7',
    category: 'SMOOTH',
    subcategory: 'REFINE',
    name: 'Gentle exfoliating toner',
    price: '42,00',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194058_d89610de-05f8-45e4-8196-0680296c565a.png&w=1280&q=85',
  },
];

// Custom hook: IntersectionObserver
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

export const BestSellersCarousel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'best sellers' | 'sets'>('best sellers');
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { ref: sectionRef, isVisible } = useInView(0.1);

  // Mouse wheel horizontal scroll handler
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Update scroll progress
  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(el.scrollLeft / maxScroll);
    } else {
      setScrollProgress(0);
    }
  };

  const filteredProducts =
    activeTab === 'sets'
      ? PRODUCTS.filter((p) => p.isSet)
      : PRODUCTS;

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen bg-[#F9F4F0] text-black flex flex-col justify-center px-4 sm:px-6 lg:px-10 py-12 sm:py-16 box-border overflow-hidden"
    >
      {/* Tab Header */}
      <div
        className={`flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12 transition-all duration-800 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Tab 1: best sellers */}
        <button
          onClick={() => setActiveTab('best sellers')}
          className="group flex items-center gap-3 sm:gap-4 text-left cursor-pointer border-none bg-transparent p-0 focus:outline-none"
        >
          {activeTab === 'best sellers' && (
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1a1a1a] shrink-0 animate-scale-in" />
          )}
          <span
            className={`text-2xl sm:text-4xl md:text-5xl font-medium duration-300 ${
              activeTab === 'best sellers'
                ? 'text-[#1a1a1a]'
                : 'text-gray-400 group-hover:text-gray-600'
            }`}
          >
            best sellers
          </span>
        </button>

        {/* Tab 2: sets */}
        <button
          onClick={() => setActiveTab('sets')}
          className="group flex items-center gap-3 sm:gap-4 text-left cursor-pointer border-none bg-transparent p-0 focus:outline-none"
        >
          {activeTab === 'sets' && (
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1a1a1a] shrink-0 animate-scale-in" />
          )}
          <span
            className={`text-2xl sm:text-4xl md:text-5xl font-medium duration-300 ${
              activeTab === 'sets'
                ? 'text-[#1a1a1a]'
                : 'text-gray-400 group-hover:text-gray-600'
            }`}
          >
            sets
          </span>
        </button>
      </div>

      {/* Product Carousel */}
      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className={`flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] lg:w-[calc(25%-1px)] border border-gray-200 -ml-[1px] first:ml-0 pt-4 pb-6 transition-all duration-500 ease-out bg-[#F9F4F0] flex flex-col justify-between ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              transitionDelay: `${200 + index * 80}ms`,
            }}
          >
            {/* Category label area */}
            <div className="px-4 h-12 flex flex-col justify-center">
              <span className="text-xs font-medium tracking-wider uppercase text-black">
                {product.category}
              </span>
              {product.subcategory && (
                <span className="text-xs text-gray-500 uppercase mt-0.5">
                  {product.subcategory}
                </span>
              )}
            </div>

            {/* Product image */}
            <div className="mx-4 aspect-[3/4] rounded-lg overflow-hidden bg-[#F9F4F0] relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            {/* Product info */}
            <div className="mt-4 text-center px-4">
              <p className="text-sm text-gray-800 hover:text-[#1a1a1a] transition-colors duration-300 cursor-pointer">
                {product.name}
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-sm font-normal text-black">
                  {product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {product.oldPrice}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Progress Bar */}
      <div className="mt-8 sm:mt-10 mx-auto w-full max-w-[280px]">
        <div className="h-[2px] bg-gray-300 rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-[#1a1a1a] rounded-full transition-transform duration-150 ease-out"
            style={{
              width: '30%',
              transform: `translateX(${scrollProgress * (100 / 0.3 * (1 - 0.3))}%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default BestSellersCarousel;
