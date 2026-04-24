export default function Input({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-medium text-muted tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-surface2 border border-border rounded-xl px-4 py-3
          text-white font-dm text-sm outline-none
          placeholder:text-muted placeholder:opacity-60
          focus:border-accent focus:ring-2 focus:ring-accent/20
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
