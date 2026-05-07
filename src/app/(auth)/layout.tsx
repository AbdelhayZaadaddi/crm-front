export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full min-h-screen">
      {/* ── Left panel ── */}
      <aside className="hidden md:flex w-[340px] min-w-[340px] bg-[#1e2124] flex-col px-9 py-12 relative overflow-hidden">
        {/* decorative radial blobs */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,158,127,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,158,127,0.12) 0%, transparent 70%)' }}
        />

        {/* Brand */}
        <div className="flex items-center gap-3 mb-14 relative">
          <div className="w-[38px] h-[38px] bg-[#1a9e7f] rounded-[9px] flex items-center justify-center text-white font-semibold text-base shrink-0">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-white text-[15px] font-semibold tracking-tight leading-none">ZXY</span>
            <span className="text-[#6b7f7a] text-[10px] font-medium tracking-[1.2px] uppercase mt-0.5">Customer Ops</span>
          </div>
        </div>

        {/* Headline */}
        <h2 className="relative text-white text-[26px] font-semibold leading-[1.35] tracking-tight mb-4">
          Your workspace,<br />
          <span className="text-[#1a9e7f]">always in sync.</span>
        </h2>
        <p className="relative text-[#8a9ea0] text-[13.5px] leading-[1.65] mb-10">
          Manage customers, tasks, and campaigns from one unified platform built for ops teams.
        </p>

        {/* Stat cards */}
        <div className="relative flex flex-col gap-2.5 mb-auto">
          <div className="bg-white/5 border border-white/[0.07] rounded-md px-4 py-3.5 flex items-center gap-3.5">
            <div className="w-2 h-2 rounded-full bg-[#1a9e7f] shrink-0" />
            <div>
              <div className="text-[#8a9ea0] text-[11.5px] mb-0.5">Open tasks</div>
              <div className="text-white text-sm font-medium">8 active</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/[0.07] rounded-md px-4 py-3.5 flex items-center gap-3.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <div className="text-[#8a9ea0] text-[11.5px] mb-0.5">Active campaigns</div>
              <div className="text-white text-sm font-medium">3 running</div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/[0.07] rounded-md px-4 py-3.5 flex items-center gap-3.5">
            <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
            <div>
              <div className="text-[#8a9ea0] text-[11.5px] mb-0.5">Customers</div>
              <div className="text-white text-sm font-medium">15 accounts</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-9 border-t border-white/[0.06] pt-5 text-[#4b5563] text-[11.5px] leading-[1.6]">
          © 2026 ZXY · Privacy · Terms
        </div>
      </aside>

      {/* ── Right panel ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 bg-[#f4f5f7]">
        {children}
      </main>
    </div>
  )
}
