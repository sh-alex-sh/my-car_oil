export default function Stats() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <p className="text-sm">统计功能即将上线</p>
      <p className="text-xs mt-1 opacity-60">Phase 2 开发中</p>
    </div>
  );
}
