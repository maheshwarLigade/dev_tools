import { useState, useEffect } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { Palette, Layers } from 'lucide-react';

export default function ColorConverter() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const handleHexChange = (val: string) => {
    setHex(val);
    const rgbVal = hexToRgb(val);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    }
  };

  const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert colors between HEX, RGB, and HSL formats with a live preview."
      onClear={() => handleHexChange('#3B82F6')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">HEX Code</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
                className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden"
              />
              <div className="relative flex-1">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-mono text-xl">#</span>
                 <input
                  type="text"
                  value={hex.replace('#', '')}
                  onChange={(e) => handleHexChange('#' + e.target.value.toUpperCase())}
                  className="w-full bg-bg-editor border border-border-main rounded-xl pl-10 pr-6 py-4 text-2xl font-mono outline-none focus:border-brand/50 transition-all text-white shadow-xl"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between pl-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">RGB (Red, Green, Blue)</label>
                 <CopyButton text={rgbString} />
               </div>
               <div className="bg-bg-sidebar border border-border-main rounded-xl p-4 flex items-center justify-between font-mono text-white">
                  <span>{rgbString}</span>
                  <div className="flex gap-2">
                    <span className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-[10px] border border-red-500/20">{rgb.r}</span>
                    <span className="w-8 h-8 rounded bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-[10px] border border-green-500/20">{rgb.g}</span>
                    <span className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px] border border-blue-500/20">{rgb.b}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2">
               <div className="flex items-center justify-between pl-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">HSL (Hue, Saturation, Lightness)</label>
                 <CopyButton text={hslString} />
               </div>
               <div className="bg-bg-sidebar border border-border-main rounded-xl p-4 flex items-center justify-between font-mono text-white">
                  <span>{hslString}</span>
                  <div className="flex gap-2 text-brand">
                    <span className="w-10 h-8 rounded bg-brand/10 flex items-center justify-center font-bold text-[10px] border border-brand/20">{hsl.h}°</span>
                    <span className="w-10 h-8 rounded bg-brand/10 flex items-center justify-center font-bold text-[10px] border border-brand/20">{hsl.s}%</span>
                    <span className="w-10 h-8 rounded bg-brand/10 flex items-center justify-center font-bold text-[10px] border border-brand/20">{hsl.l}%</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Color Preview</label>
           <div className="flex-1 rounded-3xl shadow-2xl relative overflow-hidden group border border-border-main" style={{ backgroundColor: hex }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
                 <div className="text-white">
                    <h4 className="text-4xl font-black tracking-tighter mb-1 opacity-90">{hex}</h4>
                    <p className="text-xs font-medium opacity-60 uppercase tracking-widest">{hslString}</p>
                 </div>
              </div>
              <div className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Palette size={20} />
              </div>
           </div>

           <div className="bg-bg-header/50 border border-border-main rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-text-secondary">
                <Layers size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Common Tones</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                 {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(l => (
                   <div 
                    key={l}
                    className="aspect-square rounded-md border border-white/5 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${l}%)` }}
                    onClick={() => handleHexChange(rgbToHex(
                      Math.round(255 * (l/100)), 
                      Math.round(255 * (l/100)), 
                      Math.round(255 * (l/100))
                    ))}
                    title={`Lightness: ${l}%`}
                   />
                 ))}
              </div>
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
