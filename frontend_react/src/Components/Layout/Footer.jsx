import React from 'react';
// import '../styles/Footer.css'; // Deleted

function Footer() {
    return (
        <footer className="py-xl mt-auto text-center">
            <p className="text-sm text-text-secondary m-0 text-gray-400">
                Report bugs and submit suggestions via <a href="mailto:muqingshen@gmail.com" className="text-gray-400 underline hover:text-primary transition-colors">email</a>.
            </p>
        </footer>
    );
}

export default Footer;
