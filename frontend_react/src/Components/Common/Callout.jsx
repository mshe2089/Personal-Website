const variants = {
  tip: 'border-blue-400 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-100',
  note: 'border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-100',
  success: 'border-green-400 bg-green-50 text-green-950 dark:border-green-500 dark:bg-green-950/30 dark:text-green-100',
};

function Callout({ emoji = '💡', variant = 'tip', children }) {
  const variantClasses = variants[variant] ?? variants.tip;

  return (
    <aside
      className={`flex items-start gap-sm rounded-lg border px-md py-sm text-sm leading-relaxed ${variantClasses}`}
      role="note"
    >
      <span className="shrink-0 text-base" aria-hidden="true">{emoji}</span>
      <div>{children}</div>
    </aside>
  );
}

export default Callout;
