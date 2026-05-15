import React, { useState, useMemo } from 'react';
import ToolLayout from '../ui/ToolLayout';
import { Copy, CheckCircle } from 'lucide-react';

function CopyIconButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`p-1.5 rounded transition-all border ${
        copied 
          ? 'bg-green-500/10 border-green-500/50 text-green-400' 
          : 'bg-bg-header border-border-subtle hover:bg-neutral-700 text-text-secondary hover:text-text-main'
      }`}
      title="Copy"
    >
      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default function IpCalculator() {
  const [tab, setTab] = useState<'subnet' | 'cidr'>('subnet');
  const [ip, setIp] = useState('192.168.1.10');
  const [mask, setMask] = useState('255.255.255.0');
  const [cidrPrefix, setCidrPrefix] = useState('24');
  const [resultsData, setResultsData] = useState<any>(null);

  const ipToLong = (ipStr: string) => {
    const parts = ipStr.split('.').map(p => parseInt(p.trim()));
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
    return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
  };

  const longToIp = (long: number) => {
    return [
      (long >>> 24) & 0xff,
      (long >>> 16) & 0xff,
      (long >>> 8) & 0xff,
      long & 0xff
    ].join('.');
  };

  const maskToPrefix = (maskStr: string) => {
    const long = ipToLong(maskStr);
    if (long === null) return null;
    let prefix = 0;
    for (let i = 31; i >= 0; i--) {
      if ((long >>> i) & 1) prefix++;
      else break;
    }
    return prefix;
  };

  const prefixToMaskSize = (prefix: number) => {
    if (prefix < 0 || prefix > 32) return null;
    let long = 0;
    for (let i = 0; i < prefix; i++) {
       long |= (1 << (31 - i));
    }
    return long >>> 0;
  };

  const calculate = () => {
    const ipLong = ipToLong(ip);
    let maskLong: number | null = null;
    let prefix: number | null = null;

    if (tab === 'subnet') {
      maskLong = ipToLong(mask);
      prefix = maskLong !== null ? maskToPrefix(mask) : null;
    } else {
      prefix = parseInt(cidrPrefix);
      maskLong = prefixToMaskSize(prefix);
    }

    if (ipLong === null || maskLong === null || prefix === null) return;

    const networkLong = (ipLong & maskLong) >>> 0;
    const broadcastLong = (networkLong | (~maskLong >>> 0)) >>> 0;
    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = totalHosts > 2 ? totalHosts - 2 : (totalHosts === 1 ? 1 : totalHosts);
    const firstHost = totalHosts > 2 ? networkLong + 1 : networkLong;
    const lastHost = totalHosts > 2 ? broadcastLong - 1 : broadcastLong;

    setResultsData({
      network: longToIp(networkLong),
      broadcast: longToIp(broadcastLong),
      usableRange: totalHosts >= 1 ? `${longToIp(firstHost)} - ${longToIp(lastHost)}` : 'N/A',
      totalHosts: totalHosts.toLocaleString(),
      usableHosts: usableHosts.toLocaleString(),
      mask: longToIp(maskLong),
      cidr: `/${prefix}`
    });
  };

  // Run calculation initially
  React.useEffect(() => {
    calculate();
  }, []);

  const results = [
    { label: 'Network Address', value: resultsData?.network || '-' },
    { label: 'Broadcast Address', value: resultsData?.broadcast || '-' },
    { label: 'Usable Host Range', value: resultsData?.usableRange || 'N/A' },
    { label: 'Total Hosts', value: resultsData?.totalHosts || '-' },
    { label: 'Usable Hosts', value: resultsData?.usableHosts || '-' },
    { label: 'Subnet Mask', value: resultsData?.mask || '-' },
    { label: 'CIDR Notation', value: resultsData?.cidr || '-' },
  ];

  return (
    <ToolLayout 
      title="IP Address Calculator" 
      description="For subnetting and CIDR conversion. Enter data on the left, view results on the right."
    >
      <div className="flex flex-col lg:flex-row gap-12 h-full py-4 max-w-6xl">
        {/* Input Section */}
        <div className="w-full lg:w-[400px] flex flex-col gap-8 shrink-0">
          <div className="flex p-1 bg-bg-sidebar rounded-lg border border-border-main">
            <button 
              onClick={() => setTab('subnet')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${tab === 'subnet' ? 'bg-neutral-800 text-white border border-border-subtle shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              Subnet Calculator
            </button>
            <button 
              onClick={() => setTab('cidr')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${tab === 'cidr' ? 'bg-neutral-800 text-white border border-border-subtle shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              CIDR Calculator
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">IP Address</label>
              <input 
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-bg-editor border border-border-main rounded px-4 py-2.5 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
                placeholder="192.168.1.10"
              />
            </div>

            {tab === 'subnet' ? (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">Subnet Mask</label>
                <input 
                  type="text"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  className="w-full bg-bg-editor border border-border-main rounded px-4 py-2.5 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
                  placeholder="255.255.255.0"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">CIDR Prefix</label>
                <div className="flex items-center gap-3">
                   <div className="bg-bg-header border border-border-main rounded px-3 py-2.5 text-sm font-mono text-text-secondary">/</div>
                   <input 
                    type="number"
                    min={0}
                    max={32}
                    value={cidrPrefix}
                    onChange={(e) => setCidrPrefix(e.target.value)}
                    className="flex-1 bg-bg-editor border border-border-main rounded px-4 py-2.5 text-sm font-mono outline-none focus:border-brand/50 transition-colors text-white"
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={calculate}
            className="w-full bg-neutral-900 border border-border-main hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded transition-all active:scale-[0.98] mt-auto uppercase text-xs tracking-widest"
          >
            Calculate
          </button>
        </div>

        {/* Results Section */}
        <div className="flex-1 flex flex-col gap-6 bg-white/5 p-6 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-80 pl-1">Calculation Results</h3>
          <div className="space-y-4">
            {results.map((res, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <span className="text-xs text-text-secondary font-medium w-32 shrink-0">{res.label}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-bg-editor border border-border-main rounded px-4 py-2 text-sm text-text-main font-mono shadow-inner min-h-[36px] flex items-center">
                    {res.value}
                  </div>
                  <CopyIconButton text={res.value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
