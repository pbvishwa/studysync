export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'font-dm font-semibold rounded-xl px-6 py-3 transition-all duration-200 cursor-pointer border-none text-base'

  const variants = {
    primary: 'bg-gradient-to-br from-accent to-[#5a48e0] text-white shadow-[0_4px_30px_rgba(124,106,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(124,106,255,0.4)]',
    secondary: 'bg-transparent text-white border border-border hover:bg-surface hover:border-accent',
    ghost: 'bg-transparent text-muted hover:text-white hover:bg-surface2',
    danger: 'bg-gradient-to-br from-red-500 to-red-700 text-white hover:-translate-y-0.5',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
