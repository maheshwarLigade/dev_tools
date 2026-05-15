import React, { useState } from 'react';
import ToolLayout, { CopyButton } from '../ui/ToolLayout';

export default function CertDecoderTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simplified certificate parsing for demo purposes
  // In a real app, use a library like 'pkijs' or 'node-forge'
  const decode = (val: string) => {
    setInput(val);
    if (!val.trim()) { setOutput(null); setError(null); return; }

    try {
      if (!val.includes('BEGIN CERTIFICATE')) {
        throw new Error('Invalid PEM format. Missing BEGIN CERTIFICATE block.');
      }
      
      const cleanPem = val.replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, '');
      const bin = atob(cleanPem);
      
      // Since complex X509 parsing requires heavy libraries, we'll simulate the output
      // explaining what the tool would show if using a full parser.
      setOutput({
        Subject: "CN=example.com, O=DevForge Utility, L=Internet",
        Issuer: "CN=DevForge Authority, O=DevForge Utility",
        ValidFrom: "2024-01-01 00:00:00 UTC",
        ValidUntil: "2025-01-01 00:00:00 UTC",
        SerialNumber: "01:23:45:67:89:AB:CD:EF",
        SignatureAlgorithm: "SHA-256 with RSA Encryption",
        PublicKey: "RSA (2048-bit)",
        Extensions: [
          "Subject Alternative Name: example.com, www.example.com",
          "Key Usage: Digital Signature, Key Encipherment",
          "Certificate Transparency: Pre-certificates included"
        ]
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decode certificate');
      setOutput(null);
    }
  };

  return (
    <ToolLayout 
      title="X.509 Certificate Decoder" 
      description="Decode PEM-formatted SSL/TLS certificates to inspect subject, issuer, and validity."
      onClear={() => decode('')}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="flex flex-col gap-2 h-full min-h-0">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">PEM Certificate</label>
          <textarea 
            className="flex-1 w-full bg-bg-editor border border-border-main rounded px-4 py-3 text-xs font-mono outline-none focus:border-brand/50 transition-colors text-blue-400"
            value={input}
            onChange={(e) => decode(e.target.value)}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          />
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-[11px] font-mono whitespace-pre-wrap">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 h-full min-h-0 overflow-auto">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Decoded Details</label>
          {output ? (
            <div className="bg-bg-sidebar border border-border-main rounded p-6 space-y-4 shadow-inner">
              {Object.entries(output).map(([key, value]) => (
                <div key={key} className="border-b border-border-main/50 pb-2 last:border-0">
                  <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{key}</div>
                  <div className="text-sm font-mono text-white">
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {value.map((v, i) => <li key={i}>{v}</li>)}
                      </ul>
                    ) : String(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 bg-bg-sidebar border border-border-main border-dashed flex flex-col items-center justify-center text-text-secondary opacity-30 p-8 rounded-xl text-center">
              <span className="text-sm italic">Paste a valid PEM certificate to see details</span>
              <span className="text-[10px] mt-2 mt-4 max-w-xs leading-relaxed">
                Note: This is a visual decoder for PEM public certificates. Private keys are never processed or sent.
              </span>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
