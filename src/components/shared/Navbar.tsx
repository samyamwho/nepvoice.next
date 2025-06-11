import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useProfile } from '@/auth/CurrentProfile'; // Adjust path if necessary

interface NavbarProps {
    pricingRef: React.RefObject<HTMLDivElement>;
}

const Navbar: React.FC<NavbarProps> = ({ pricingRef }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use the ProfileContext
    const { isAuthenticated, isLoading: isProfileLoading } = useProfile();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleScrollToPricing = () => {
        if (pricingRef.current) {
            pricingRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleGetAppClick = () => {
        if (isProfileLoading) return; // Optionally, disable button or show loader
        if (isAuthenticated) {
            router.push('/main/dashboard');
        } else {
            router.push('/auth/googleauth');
        }
    };

    const isDashboardOrPlayer = pathname === '/' || pathname === '/player';

    return (
        <nav
            className={`fixed top-0 w-full z-20 px-6 py-4 transition-all duration-300 ${
                isDashboardOrPlayer
                    ? isScrolled
                        ? 'bg-white/60 backdrop-blur shadow-md text-black'
                        : 'bg-transparent text-black'
                    : 'bg-[#28464E] text-white shadow-2xl'
            }`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Image src="/assets/NepVoice.png" alt="logo" height={150} width={150}  />
                    </Link>
                </div>

                {/* Middle: Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/platform" className="hover:text-gray transition">PLATFORM</Link>
                    <Link href="/solutions" className="hover:text-gray-700 transition">SOLUTION</Link>
                    <Link href="/api" className="hover:text-gray-700 transition">API</Link>
                    <Link href="/about" className="hover:text-gray-700 transition">ABOUT</Link>
                    <button onClick={handleScrollToPricing} className="hover:text-gray-700 transition">
                        PRICING
                    </button>
                </div>

                {/* Right: Get App & Profile Dropdown */}
                <div className="flex items-center gap-6">
                    <button
                        className="bg-[#000000] text-white hover:bg-opacity-90 px-4 py-2 rounded-lg text-sm font-medium border border-white disabled:opacity-50"
                        onClick={handleGetAppClick}
                        disabled={isProfileLoading} // Optionally disable while loading
                    >
                        {isProfileLoading ? "Loading..." : "Get the App"}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;