'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path: string) => {
        return pathname === path;
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex w-full justify-between sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent" onClick={closeMenu}>
                                Notes & Tasks
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                href="/schedule"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/schedule')
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                    }`}
                            >
                                Gym Schedule
                            </Link>
                            <Link
                                href="/notes"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive('/notes')
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                    }`}
                            >
                                Notes
                            </Link>
                        </div>
                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={toggleMenu}
                                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Icon when menu is closed */}
                                {!isOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    /* Icon when menu is open */
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden border-t border-border/40`}>
                <div className="pt-2 pb-4 space-y-1 px-4">
                    <Link
                        href="/schedule"
                        onClick={closeMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/schedule')
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                            }`}
                    >
                        Gym Schedule
                    </Link>
                    <Link
                        href="/notes"
                        onClick={closeMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive('/notes')
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:bg-muted hover:border-border hover:text-foreground'
                            }`}
                    >
                        Notes
                    </Link>
                </div>
            </div>
        </nav>
    );
}
