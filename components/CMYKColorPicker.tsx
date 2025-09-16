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

      {/* CMYK sliders */}
      <div className="grid grid-cols-1 gap-4">
        {/* Cyan */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-cyan-500 rounded"></span>
              Cyan (C)
            </span>
            <span>{cmyk.c}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.c}
            onChange={(e) => handleCmykChange('c', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gradient-to-r from-white to-cyan-500 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Magenta */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-magenta-500 rounded" style={{backgroundColor: '#e91e63'}}></span>
              Magenta (M)
            </span>
            <span>{cmyk.m}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.m}
            onChange={(e) => handleCmykChange('m', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, white, #e91e63)`
            }}
          />
        </div>

        {/* Yellow */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-500 rounded"></span>
              Yellow (Y)
            </span>
            <span>{cmyk.y}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.y}
            onChange={(e) => handleCmykChange('y', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gradient-to-r from-white to-yellow-500 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Key (Black) */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-black rounded"></span>
              Black (K)
            </span>
            <span>{cmyk.k}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={cmyk.k}
            onChange={(e) => handleCmykChange('k', parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-gradient-to-r from-white to-black rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Hex input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hex Color
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};