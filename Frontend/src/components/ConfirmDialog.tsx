import { X } from 'lucide-react';

export function ConfirmDialog({ title, body, onConfirm, onClose }: { title: string; body: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="panel w-full max-w-md rounded-xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-800">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-rose-600 px-4 py-2 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
}
