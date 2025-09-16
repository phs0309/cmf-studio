import React, { useState, useEffect } from 'react';

interface CMYKColorPickerProps {
  value: string; // hex color
  onChange: (color: string) => void;
  disabled?: boolean;
}

interface CMYKValues {
  c: number; // Cyan (0-100)
  m: number; // Magenta (0-100)
  y: number; // Yellow (0-100)
  k: number; // Key/Black (0-100)
}

// 인기 색상 팔레트 프리셋
const COLOR_PRESETS = [
  { name: '애플 블루', hex: '#007AFF', cmyk: { c: 100, m: 50, y: 0, k: 0 } },
  { name: '레드', hex: '#FF3B30', cmyk: { c: 0, m: 90, y: 85, k: 0 } },
  { name: '오렌지', hex: '#FF9500', cmyk: { c: 0, m: 50, y: 100, k: 0 } },
  { name: '옐로우', hex: '#FFCC00', cmyk: { c: 0, m: 20, y: 100, k: 0 } },
  { name: '그린', hex: '#34C759', cmyk: { c: 70, m: 0, y: 100, k: 0 } },
  { name: '민트', hex: '#5AC8FA', cmyk: { c: 65, m: 0, y: 10, k: 0 } },
  { name: '퍼플', hex: '#AF52DE', cmyk: { c: 50, m: 70, y: 0, k: 0 } },
  { name: '핑크', hex: '#FF2D92', cmyk: { c: 0, m: 85, y: 30, k: 0 } },
  { name: '다크 그레이', hex: '#8E8E93', cmyk: { c: 0, m: 0, y: 0, k: 45 } },
  { name: '블랙', hex: '#000000', cmyk: { c: 0, m: 0, y: 0, k: 100 } },
  { name: '화이트', hex: '#FFFFFF', cmyk: { c: 0, m: 0, y: 0, k: 0 } },
  { name: '네이비', hex: '#1D1D1F', cmyk: { c: 100, m: 85, y: 25, k: 10 } },
];

export const CMYKColorPicker: React.FC<CMYKColorPickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [cmyk, setCmyk] = useState<CMYKValues>({ c: 0, m: 0, y: 0, k: 0 });

  // Convert hex to CMYK
  const hexToCmyk = (hex: string): CMYKValues => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Calculate CMYK
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  // Convert CMYK to hex
  const cmykToHex = (cmyk: CMYKValues): string => {
    const c = cmyk.c / 100;
    const m = cmyk.m / 100;
    const y = cmyk.y / 100;
    const k = cmyk.k / 100;
    
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    
    const toHex = (n: number) => {
      const hex = n.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Update CMYK when hex value changes
  useEffect(() => {
    setCmyk(hexToCmyk(value));
  }, [value]);

  // Handle CMYK input changes
  const handleCmykChange = (component: keyof CMYKValues, newValue: number) => {
    const newCmyk = { ...cmyk, [component]: Math.max(0, Math.min(100, newValue)) };
    setCmyk(newCmyk);
    onChange(cmykToHex(newCmyk));
  };

  // Handle color preset selection
  const handlePresetSelect = (preset: typeof COLOR_PRESETS[0]) => {
    setCmyk(preset.cmyk);
    onChange(preset.hex);
  };

  return (
    <div className="space-y-4">
      {/* Color preview */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <div className="text-sm font-mono text-gray-600">{value}</div>
      </div>

      {/* Color Palette Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">
          색상 팔레트
        </label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => !disabled && handlePresetSelect(preset)}
              disabled={disabled}
              className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 ${
                value.toUpperCase() === preset.hex.toUpperCase()
                  ? 'border-purple-500 ring-2 ring-purple-200 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
              style={{ backgroundColor: preset.hex }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* CMYK sliders */}
      <div className="grid grid-cols-1 gap-3">
        {/* Cyan */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center justify-between text-sm font-medium text-gray-800 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-cyan-500 rounded-full shadow-sm"></span>
              Cyan (C)
            </span>
            <span className="text-purple-600 font-semibold">{cmyk.c}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.c}
            onChange={(e) => handleCmykChange('c', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-3 bg-gradient-to-r from-gray-100 to-cyan-500 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 slider-thumb"
          />
        </div>

        {/* Magenta */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center justify-between text-sm font-medium text-gray-800 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full shadow-sm" style={{backgroundColor: '#e91e63'}}></span>
              Magenta (M)
            </span>
            <span className="text-purple-600 font-semibold">{cmyk.m}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.m}
            onChange={(e) => handleCmykChange('m', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 slider-thumb"
            style={{
              background: `linear-gradient(to right, #f3f4f6, #e91e63)`
            }}
          />
        </div>

        {/* Yellow */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center justify-between text-sm font-medium text-gray-800 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></span>
              Yellow (Y)
            </span>
            <span className="text-purple-600 font-semibold">{cmyk.y}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.y}
            onChange={(e) => handleCmykChange('y', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-3 bg-gradient-to-r from-gray-100 to-yellow-500 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 slider-thumb"
          />
        </div>

        {/* Key (Black) */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="flex items-center justify-between text-sm font-medium text-gray-800 mb-2">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-black rounded-full shadow-sm"></span>
              Black (K)
            </span>
            <span className="text-purple-600 font-semibold">{cmyk.k}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.k}
            onChange={(e) => handleCmykChange('k', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-3 bg-gradient-to-r from-gray-100 to-black rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 slider-thumb"
          />
        </div>
      </div>

      {/* Hex input */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Hex Color
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};