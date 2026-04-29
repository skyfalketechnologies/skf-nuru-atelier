"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-gold/40 bg-[#0d0d0d] p-5">
        <h2 className="font-serif text-2xl text-gold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded border border-gold/40 px-4 py-2 text-sm text-gold" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="rounded bg-gold px-4 py-2 text-sm text-black" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

