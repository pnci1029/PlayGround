export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      {label ? <p className="text-sm text-gray-400">{label}</p> : null}
    </div>
  )
}
