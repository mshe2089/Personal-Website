/**
 * PageTemplate
 * Standardizes page headers, optional metadata, and the content container.
 */
const PageTemplate = ({ title, date, author, tag, children }) => {
  const metadata = [date, author].filter(Boolean);

  return (
    <div className="page-container animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className={`${tag ? 'mb-sm' : 'mb-2xl'} flex items-end justify-between gap-lg border-b border-default pb-sm`}>
        <h1 className="m-0 font-serif text-3xl font-semibold text-primary">
          {title}
        </h1>
        {metadata.length > 0 && (
          <div className="flex shrink-0 items-center gap-sm text-xs text-secondary">
            {metadata.map((value, index) => (
              <span key={value} className="contents">
                {index > 0 && <span>·</span>}
                <span>{value}</span>
              </span>
            ))}
          </div>
        )}
      </header>

      {tag && (
        <p className="mb-2xl text-sm italic text-secondary opacity-60">
          {tag}
        </p>
      )}

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default PageTemplate;
