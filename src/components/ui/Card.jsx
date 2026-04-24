export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-[#16161f] border border-border rounded-2xl p-6
        ${hover ? 'transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
