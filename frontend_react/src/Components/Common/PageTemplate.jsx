/**
 * PageTemplate
 * Standardizes page headers, optional metadata, and the content container.
 */
const PageTemplate = ({ title, date, author, children }) => {
  const metadata = [date, author].filter(Boolean);

  return (
    <div className="page-container animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-xl border-b border-strong pb-sm">
        <h1 className="h1-primary mb-md border-none pb-0">{title}</h1>
        {metadata.length > 0 && (
          <div className="flex items-center gap-md text-secondary font-sans uppercase tracking-widest text-xs font-semibold">
            {metadata.map((value, index) => (
              <span key={value} className="contents">
                {index > 0 && <span className="h-3 w-px bg-strong" />}
                <span>{value}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default PageTemplate;
