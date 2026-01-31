import React from 'react';

/**
 * PageTemplate
 * A universal layout component for all pages in The Daniel Lab.
 * Standardizes headers, metadata (date/author), and the primary content container.
 */
const PageTemplate = ({ title, date, author, children }) => {
    return (
        <div className="page-container animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-2xl border-b border-strong pb-sm">
                <h1 className="h1-primary mb-md border-none pb-0">
                    {title}
                </h1>
                <div className="flex items-center gap-md text-secondary font-sans uppercase tracking-widest text-xs font-semibold">
                    <span>{date}</span>
                    <span className="h-3 w-px bg-strong"></span>
                    <span>{author}</span>
                </div>
            </header>

            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default PageTemplate;
