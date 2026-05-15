import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';
import { Upload, ImageIcon, FileText } from 'lucide-react';

export default function Base64ImageTool() {
  const [base64, setBase64] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBase64(result);
        setPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBase64Change = (val: string) => {
    setBase64(val);
    if (val.startsWith('data:image')) {
      setPreview(val);
    } else {
      setPreview(null);
    }
  };

  return (
    <ToolLayout 
      title="Base64 Image Encoder/Decoder" 
      description="Convert images to Base64 strings for CSS/HTML or decode them back to images."
      onClear={() => { setBase64(''); setPreview(null); }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Target Image</label>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-bg-sidebar border-2 border-dashed border-border-main rounded-xl p-8 flex flex-col items-center justify-center text-text-secondary group-hover:border-brand/50 group-hover:bg-neutral-800 transition-all">
                <Upload size={32} className="mb-2 opacity-50 group-hover:text-brand group-hover:opacity-100" />
                <span className="text-sm font-medium">Click or drag image to encode</span>
                <span className="text-[10px] opacity-50 mt-1">PNG, JPG, SVG, GIF, WebP</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Base64 String</label>
              {base64 && <CopyButton text={base64} />}
            </div>
            <textarea 
              className="flex-1 w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-xs font-mono outline-none focus:border-brand/50 transition-colors text-white resize-none"
              value={base64}
              onChange={(e) => handleBase64Change(e.target.value)}
              placeholder="Paste Base64 data here to preview..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Preview</label>
          <div className="flex-1 bg-bg-sidebar border border-border-main rounded-xl flex items-center justify-center overflow-hidden p-8 relative">
            {preview ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded" />
            ) : (
              <div className="flex flex-col items-center text-text-secondary opacity-30">
                <ImageIcon size={64} />
                <span className="text-xs mt-4">Invalid image data or empty</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
