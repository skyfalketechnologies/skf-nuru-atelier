type AdminLoaderProps = {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8 border-2",
  md: "h-11 w-11 border-2",
  lg: "h-14 w-14 border-[3px]",
} as const;

export function AdminLoader({ message, className = "", size = "md" }: AdminLoaderProps) {
  const caption = message?.trim() ?? "";
  const showCaption = caption.length > 0;
  return (
    <div
      className={`flex flex-col items-center justify-center ${showCaption ? "gap-5" : ""} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={showCaption ? undefined : "Loading"}
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-slate-600/45 border-t-sky-400 border-r-transparent shadow-[0_0_24px_-4px_rgba(56,189,248,0.35)] animate-spin`}
        style={{ animationDuration: size === "lg" ? "0.95s" : "0.85s" }}
        aria-hidden
      />
      {showCaption ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{caption}</p>
          <div className="h-px w-16 overflow-hidden rounded-full bg-slate-700/80">
            <div className="h-full w-1/3 animate-[admin-loader-bar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-sky-400/90 to-transparent" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type AdminFullscreenLoaderProps = {
  message?: string;
};

export function AdminFullscreenLoader({ message }: AdminFullscreenLoaderProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#06090f] px-4">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[4%] top-0 h-72 w-72 rounded-full bg-sky-500/[0.12] blur-3xl" />
        <div className="absolute bottom-0 right-[8%] h-64 w-64 rounded-full bg-teal-400/[0.06] blur-3xl" />
      </div>
      <div className="relative z-10 rounded-2xl border border-slate-500/20 bg-slate-950/40 px-14 py-12 shadow-2xl backdrop-blur-sm">
        <AdminLoader message={message} size="lg" />
      </div>
    </div>
  );
}
