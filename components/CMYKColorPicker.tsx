import React, { useState, useEffect } from 'react';

interface CMYKColorPickerProps {
  value: string; // hex color
  onChange: (color: string) => void;
  disabled?: boolean;
  recentColors?: string[];
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
  recentColors = [],
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
    <div className="space-y-3">
      {/* Main Color Spectrum and Preview */}
      <div className="flex gap-4 items-center">
        {/* Large Color Spectrum Wheel */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-24 h-16 rounded-2xl border-3 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
              disabled ? 'filter grayscale' : ''
            }`}
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
              background: 'none',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.1)'
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        {/* Color Info */}
        <div className="flex-1">
          <div className="text-sm font-mono text-gray-600 mb-1">{value}</div>
          <div className="text-xs text-gray-500">
            C:{cmyk.c} M:{cmyk.m} Y:{cmyk.y} K:{cmyk.k}
          </div>
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">최근 사용한 색상</div>
          <div className="flex gap-1 flex-wrap">
            {recentColors.map((color, index) => (
              <button
                key={`${color}-${index}`}
                type="button"
                onClick={() => !disabled && onChange(color)}
                disabled={disabled}
                className={`w-6 h-6 rounded border transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${
                  value.toUpperCase() === color.toUpperCase()
                    ? 'border-purple-500 ring-2 ring-purple-300'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}


      {/* Color Code Input */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <label className="text-sm font-medium text-gray-700 mb-2 block">색상 코드</label>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value;
            // Validate hex color format
            if (/^#[0-9A-Fa-f]{6}$/.test(inputValue) || inputValue === '') {
              onChange(inputValue);
            }
          }}
          placeholder="#007AFF"
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
            disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'
          }`}
          maxLength={7}
        />
        <div className="text-xs text-gray-500 mt-1">
          HEX 형식으로 입력하세요 (예: #007AFF)
        </div>
      </div>
    </div>
  );
};