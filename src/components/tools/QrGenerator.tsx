import React, { useState } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

export default function QrGenerator() {
  const [text, setText] = useState('https://google.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0f172a');

  return (
    <ToolLayout 
      title="QR Code Generator" 
      description="Generate QR codes from any text or link instantly."
      onClear={() => setText('')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Content</label>
            <textarea 
              className="w-full min-h-[120px] bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-sm outline-none focus:border-blue-500/50 transition-colors"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter URL or text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Size (px)</label>
              <input 
                type="number" 
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Text Color</label>
              <input 
                type="color" 
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg p-1"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
          <div className="p-6 bg-white rounded-xl shadow-2xl">
            <QRCodeSVG 
              value={text || ' '} 
              size={size} 
              fgColor={fgColor}
              bgColor={bgColor}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mt-6 text-sm text-slate-500">Scan this code with a mobile device</p>
        </div>
      </div>
    </ToolLayout>
  );
}
