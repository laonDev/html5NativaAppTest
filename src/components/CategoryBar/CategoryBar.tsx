const PRIMARY_CATEGORIES = [
  { slug: 'home', name: 'HOME' },
  { slug: 'hot', name: 'HOT' },
  { slug: 'slot', name: 'SLOTS' },
  { slug: 'live', name: 'LIVE' },
  { slug: 'promo', name: 'PROMO' },
  { slug: 'mypick', name: 'MY PICKS' },
];

interface CategoryBarProps {
  activeCategory: string;
  subCategories: string[];
  activeSubCategory: string;
  onCategoryChange: (slug: string) => void;
  onSubCategoryChange: (slug: string) => void;
}

export function CategoryBar({
  activeCategory,
  subCategories,
  activeSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}: CategoryBarProps) {
  const useScrollableSubBar = subCategories.length > 4;

  return (
    <div className="shrink-0 border-b border-[#1b2a5c] bg-[#11256e]">
      <div className="grid h-10 grid-cols-6">
        {PRIMARY_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={[
                'relative flex items-center justify-center border-r border-[#273d86] px-1 text-[13px] font-semibold tracking-[0.01em] text-[#f3f7ff]',
                'last:border-r-0',
                isActive
                  ? 'bg-gradient-to-b from-[#4c3cff] to-[#2a4dff] shadow-[inset_0_-2px_0_#8ec8ff]'
                  : 'bg-gradient-to-b from-[#1f3a93] to-[#162c7e]',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {subCategories.length > 0 &&
        (useScrollableSubBar ? (
          <div className="h-10 overflow-x-auto border-t border-[#304eb0] bg-gradient-to-b from-[#3e57ff] to-[#2b49d5] px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-full items-center whitespace-nowrap">
              {subCategories.map((sub) => {
                const isActive = sub === activeSubCategory;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => onSubCategoryChange(sub)}
                    className={[
                      'relative h-full min-w-[25%] px-3 text-[14px] font-semibold uppercase tracking-[0.01em]',
                      'flex items-center justify-center',
                      isActive ? 'text-white' : 'text-[#c5d2ff]',
                    ].join(' ')}
                    aria-pressed={isActive}
                  >
                    {sub}
                    {isActive && <span className="absolute bottom-0 left-[18%] right-[18%] h-[2px] bg-[#c7e7ff]" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="grid h-10 border-t border-[#304eb0] bg-gradient-to-b from-[#3e57ff] to-[#2b49d5]"
            style={{ gridTemplateColumns: `repeat(${subCategories.length}, minmax(0, 1fr))` }}
          >
            {subCategories.map((sub) => {
              const isActive = sub === activeSubCategory;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSubCategoryChange(sub)}
                  className={[
                    'relative h-full px-2 text-[14px] font-semibold uppercase tracking-[0.01em]',
                    'flex items-center justify-center',
                    isActive ? 'text-white' : 'text-[#c5d2ff]',
                  ].join(' ')}
                  aria-pressed={isActive}
                >
                  {sub}
                  {isActive && <span className="absolute bottom-0 left-[18%] right-[18%] h-[2px] bg-[#c7e7ff]" />}
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}
