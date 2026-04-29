"use client";

type ToastProps = {
  message: string;
  tone?: "info" | "success" | "error";
  onClose: () => void;
};

export function Toast({ message, tone = "info", onClose }: ToastProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-400/50 text-emerald-200"
      : tone === "error"
        ? "border-red-400/50 text-red-200"
        : "border-gold/50 text-gold";

  return (
    <div className={`fixed bottom-5 right-5 z-50 rounded-lg border bg-black/95 px-4 py-3 text-sm ${toneClass}`}>
      <div className="flex items-center gap-4">
        <p>{message}</p>
        <button className="text-xs underline opacity-80 hover:opacity-100" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

