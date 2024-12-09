'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

type NavItem = {
    name: string,
    href?: string,
    onClick?: () => void,
}

const navigationLinks: NavItem[] = [
    { name: "Home", href: "/" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Careers", href: "/careers"},
    { name: "Contact Us", href: "/contact-us"}
];

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [shouldRenderMenu, setShouldRenderMenu] = useState<boolean>(false);


    function toggleMenu() {
        if (!isMenuOpen) {
            setIsMenuOpen(true);
            setShouldRenderMenu(true);
        } else {
            setIsMenuOpen(false);
            setTimeout(() => setShouldRenderMenu(false), 300);
        }
    }

    function handleLinkClick() {
        setIsMenuOpen(false);
        setTimeout(() => {
            setShouldRenderMenu(false);
        }, 300);
    }

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
                setShouldRenderMenu(false);
            }
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function renderNavLinks() {

        return navigationLinks;
    }

    return (
        <header className='flex items-center justify-center h-[75px] w-full z-50 bg-transparent'>
            <div className="relative flex justify-between items-center max-w-screen-xl w-full px-5 z-50">
                <Link href="/">
                    <div className="flex items-center cursor-pointer space-x-4">
                        <img src="/assets/cruxlogIcon.png" alt="CruxLog" className="md:h-12 h-10" />
                        <p className="font-bold text-2xl md:text-4xl bg-gradient-to-b from-bright-yellow via-[#F34971] to-primary-purple bg-clip-text text-transparent">Jakes Lawn</p>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center">
                    {renderNavLinks().map(item => (
                        item.onClick ? (
                            <button
                                key={item.name}
                                onClick={item.onClick}
                                className='py-2 px-4 mr-4 font-semibold text-white  hover:text-secondary transition-colors duration-500 ease-in-out'
                            >
                                {item.name}
                            </button>
                        ) : (
                            <Link
                                key={item.name}
                                href={item.href || '#'}
                                className='py-2 px-4 mr-4 font-semibold text-white text-glow hover:text-secondary transition-colors duration-500 ease-in-out'
                                onClick={handleLinkClick}
                            >
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="md:hidden absolute top-0 right-0 mr-4" onClick={toggleMenu}>
                    <svg
                        className={`h-8 w-8 text-gray-4 nav-icon ${isMenuOpen ? 'open' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMenuOpen ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16m-16 6h16"
                            />
                        )}
                    </svg>
                </div>

                {/* Drop menu */}
                {shouldRenderMenu && (
                    <div className={`absolute w-full top-10 right-0 mt-2 py-2 flex text-white bg-transparent/80 flex-col pb-12 min-h-screen ${isMenuOpen ? 'block' : 'hidden'}`}>
                        {renderNavLinks().map(item => (
                            item.onClick ? (
                                <button
                                    key={item.name}
                                    onClick={item.onClick}
                                    className='py-6 px-4 mr-4 font-semibold hover:text-bright-green text-center text-lg'
                                >
                                    {item.name}
                                </button>
                            ) : (
                                <Link
                                    key={item.name}
                                    href={item.href || '#'}
                                    className='py-6 px-4 mr-4 font-semibold hover:text-bright-green text-center text-lg'
                                    onClick={handleLinkClick}
                                >
                                    {item.name}
                                </Link>
                            )
                        ))}
                    </div>
                )}
            </div>
        </header>
    )
}
