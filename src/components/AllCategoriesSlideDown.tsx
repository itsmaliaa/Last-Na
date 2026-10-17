import React from 'react';
import { Check } from 'lucide-react';

interface AllCategoriesSlideDownProps {
  selectedStyleChip: string;
  onSelectStyleChip: (style: string) => void;
  selectedArtTypes: string[];
  onToggleArtType: (type: string) => void;
  selectedStyles: string[];
  onToggleStyle: (style: string) => void;
  selectedMaterials: string[];
  onToggleMaterial: (mat: string) => void;
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
  priceValue: number;
  onChangePrice: (val: number) => void;
  onClose?: () => void;
}

export const AllCategoriesSlideDown: React.FC<AllCategoriesSlideDownProps> = ({
  selectedStyleChip,
  onSelectStyleChip,
  selectedArtTypes,
  onToggleArtType,
  selectedStyles,
  onToggleStyle,
  selectedMaterials,
  onToggleMaterial,
  selectedColor,
  onSelectColor,
  priceValue,
  onChangePrice,
}) => {
  // Exact 2 rows of style pills from all Categories button slide down bar.png
  const pillRow1 = [
    'All Style',
    'Modern Expressionism',
    'Minimalist Geometry',
    'Abstract Form',
    'Traditional Chinese Ink',
    'Pop Art',
    'Cute / Kawaii',
    'Cute / Kawaii',
    'Cute / Kawaii',
  ];

  const pillRow2 = [
    'All Style',
    'Minimalist Geometry',
    'Minimalist Geometry',
    'Abstract Form',
    'Traditional Chinese Ink',
    'Pop Art',
    'Cute / Kawaii',
    'Cute / Kawaii',
    'Cute / Kawaii',
  ];

  const artTypes = [
    { name: 'Painting', count: 128 },
    { name: 'Sculpture', count: 64 },
    { name: 'Architecture', count: 32 },
    { name: 'Digital', count: 96 },
    { name: 'Photography', count: 48 },
    { name: 'Print', count: 15 },
    { name: 'Mixed Media', count: 18 },
  ];

  const styles = [
    'Modern',
    'Abstract',
    'Traditional',
    'Minimalist',
    'Pop Art',
    'Conceptual',
    'Cute',
  ];

  const materials = [
    'Oil on Canvas',
    'Acrylic',
    'Watercolor',
    'Clay',
    'Metal',
  ];

  const colorSwatchesRow1 = [
    { name: 'Red', hex: '#EF4444' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Yellow', hex: '#EAB308' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#15803D' },
    { name: 'Brown', hex: '#78350F' },
    { name: 'White', hex: '#FFFFFF', border: true },
  ];

  const colorSwatchesRow2 = [
    { name: 'Black', hex: '#1E293B' },
  ];

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xl space-y-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
      {/* 1. Two Rows of Style Pills (Exact match to all Categories button slide down bar.png) */}
      <div className="space-y-2.5 overflow-x-auto pb-1 no-scrollbar">
        {/* Row 1 */}
        <div className="flex items-center gap-2 shrink-0">
          {pillRow1.map((pill, idx) => {
            const isSelected =
              idx === 1
                ? selectedStyleChip === pill || selectedStyleChip === 'Modern Expressionism'
                : selectedStyleChip === pill && idx !== 1;
            return (
              <button
                key={`r1-${idx}`}
                onClick={() => onSelectStyleChip(pill)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E52535] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex items-center gap-2 shrink-0">
          {pillRow2.map((pill, idx) => {
            const isSelected = selectedStyleChip === `${pill}-${idx}`;
            return (
              <button
                key={`r2-${idx}`}
                onClick={() => onSelectStyleChip(`${pill}-${idx}`)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E52535] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {pill}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Five Filter Columns (Exact match to all Categories button slide down bar.png) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 pt-2 border-t border-neutral-100 text-xs">
        {/* Column 1: Art Type */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3.5 text-sm">Art Type</h4>
          <div className="space-y-2">
            {artTypes.map((type) => {
              const isChecked = selectedArtTypes.includes(type.name);
              return (
                <label
                  key={type.name}
                  onClick={() => onToggleArtType(type.name)}
                  className="flex items-center justify-between cursor-pointer hover:text-red-600 transition-colors select-none py-0.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#E52535] text-white border border-[#E52535]'
                          : 'border border-neutral-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-slate-800 font-medium">{type.name}</span>
                  </div>
                  <span className="text-neutral-400 font-mono text-[11px]">{type.count}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 2: Style */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3.5 text-sm">Style</h4>
          <div className="space-y-2">
            {styles.map((s) => {
              const isChecked = selectedStyles.includes(s);
              return (
                <label
                  key={s}
                  onClick={() => onToggleStyle(s)}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-red-600 transition-colors select-none py-0.5"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#E52535] text-white border border-[#E52535]'
                        : 'border border-neutral-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-slate-800 font-medium">{s}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 3: Materials */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3.5 text-sm">Materials</h4>
          <div className="space-y-2">
            {materials.map((m) => {
              const isChecked = selectedMaterials.includes(m);
              return (
                <label
                  key={m}
                  onClick={() => onToggleMaterial(m)}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-red-600 transition-colors select-none py-0.5"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-[#E52535] text-white border border-[#E52535]'
                        : 'border border-neutral-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-slate-800 font-medium">{m}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Column 4: Color Palette */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3.5 text-sm">Color Palette</h4>
          <div className="space-y-2.5">
            {/* Row 1: 7 swatches */}
            <div className="flex items-center gap-2">
              {colorSwatchesRow1.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => onSelectColor(isSelected ? null : c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative ${
                      c.border ? 'border border-neutral-300' : ''
                    } ${isSelected ? 'scale-125 ring-2 ring-red-500 ring-offset-2' : 'hover:scale-110'}`}
                    title={c.name}
                  />
                );
              })}
            </div>

            {/* Row 2: Black swatch */}
            <div className="flex items-center gap-2">
              {colorSwatchesRow2.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => onSelectColor(isSelected ? null : c.name)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer relative ${
                      isSelected ? 'scale-125 ring-2 ring-red-500 ring-offset-2' : 'hover:scale-110'
                    }`}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 5: Price Range (Dual dot slider matching all Categories button slide down bar.png) */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3.5 text-sm">Price Range</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">¥100</span>
              <span className="font-bold text-[#E52535]">¥10,000+</span>
            </div>

            {/* Interactive Range Track with Dual Red Thumbs */}
            <div className="relative pt-1 pb-1">
              <div className="w-full h-1 bg-neutral-200 rounded-full relative">
                <div
                  className="absolute left-0 h-full bg-[#E52535] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(15, (priceValue / 10000) * 100))}%` }}
                />
                {/* Left Thumb */}
                <div className="absolute left-0 -top-1.5 w-4 h-4 rounded-full bg-[#E52535] border-2 border-white shadow-xs pointer-events-none" />
                {/* Right Thumb */}
                <div
                  className="absolute -top-1.5 w-4 h-4 rounded-full bg-[#E52535] border-2 border-white shadow-xs pointer-events-none"
                  style={{ left: `calc(${Math.min(100, Math.max(15, (priceValue / 10000) * 100))}% - 8px)` }}
                />
              </div>

              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={priceValue}
                onChange={(e) => onChangePrice(Number(e.target.value))}
                className="w-full h-4 opacity-0 cursor-pointer absolute inset-0 z-10"
              />
            </div>

            <div className="text-[11px] text-neutral-400 text-right">
              Max selected: <span className="font-bold text-slate-700">₱{priceValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
