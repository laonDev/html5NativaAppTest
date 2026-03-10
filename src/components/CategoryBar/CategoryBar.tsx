import { useRef } from 'react';

const DEFAULT_CATEGORIES = [
  { slug: 'home', name: 'Home' },
  { slug: 'hot', name: 'Hot' },
  { slug: 'slot', name: 'Slot' },
  { slug: 'live', name: 'Live' },
  { slug: 'promo', name: 'Promo' },
  { slug: 'mypick', name: 'My Pick' },
];

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto bg-[#16213e] px-4 py-2 scrollbar-hide"
      style={{ scrollbarWidth: 'none' }}
    >
      {DEFAULT_CATEGORIES.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? 'bg-[#e94560] text-white'
              : 'bg-[#1a1a2e] text-gray-400 hover:text-white'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
