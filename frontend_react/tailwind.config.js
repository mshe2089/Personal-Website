/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            // Explicitly map background colors
            backgroundColor: {
                primary: 'var(--bg-primary)',
                secondary: 'var(--bg-secondary)',
                tertiary: 'var(--bg-tertiary)',
                'code': 'var(--code-bg)',

                // Re-mapping accents for Bg usage
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',

                // Also need to allow black/white/transparent
                black: '#000000',
                white: '#ffffff',
                transparent: 'transparent',
            },

            // Explicitly map text colors
            textColor: {
                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                inverse: 'var(--text-inverse)',

                // Re-mapping accents for Text usage
                'accent-primary': 'var(--accent-primary)',
                'accent-secondary': 'var(--accent-secondary)',

                // Also need to allow black/white
                black: '#000000',
                white: '#ffffff',
            },

            // Explicitly map border colors
            borderColor: {
                default: 'var(--border-default)',
                strong: 'var(--border-strong)',

                // Also need to allow black/white
                black: '#000000',
                white: '#ffffff',
            },

            // Keep these in extend.colors ONLY if they are truly generic (like 'blue-500' would be), 
            // but for our semantic tokens, we want specific mappings. 
            // However, to be safe and support things like "ring-primary", 
            // we can keep a Generic Palette if needed, but for now strict separation prevents the "White Text" bug.
            colors: {
                // We can leave this empty or put shared non-colliding tokens here.
                // For now, let's strictly rely on the specific keys above.
                'accent-primary': 'var(--accent-primary)', // Useful for other properties
                'accent-secondary': 'var(--accent-secondary)',
            },
            spacing: {
                '2xs': 'var(--space-2xs)',
                'xs': 'var(--space-xs)',
                'sm': 'var(--space-sm)',
                'md': 'var(--space-md)',
                'lg': 'var(--space-lg)',
                'xl': 'var(--space-xl)',
                '2xl': 'var(--space-2xl)',
                '3xl': 'var(--space-3xl)',
            },
            fontFamily: {
                serif: ['var(--font-serif)'],
                sans: ['var(--font-sans)'],
                mono: ['var(--font-mono)'],
            },
            boxShadow: {
                'brutalist': '15px 15px 0px rgba(0,0,0,0.05)',
                'brutalist-dark': '15px 15px 0px rgba(0,0,0,0.2)',
            }
        },
    },
    plugins: [],
}
