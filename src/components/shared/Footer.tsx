import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black rounded-lg shadow-sm m-4 dark:bg-[#28464E]">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-white sm:text-center dark:text-white">
                    © 2025{' '}
                    <a 
                        href="https://wiseyak.com/" 
                        className="hover:underline" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Wiseyak™
                    </a>
                    . All Rights Reserved.
                </span>

                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white dark:text-white sm:mt-0">
                    <li>
                        <Link href="/about" className="hover:underline me-4 md:me-6">
                            About
                        </Link>
                    </li>
                    <li>
                        <Link href="/privacy-policy" className="hover:underline me-4 md:me-6">
                            Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link href="/licensing" className="hover:underline me-4 md:me-6">
                            Licensing
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:underline">
                            Contact
                        </Link>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;