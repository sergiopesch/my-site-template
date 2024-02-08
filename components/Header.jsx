import React from "react";
import Link from "next/link";
import ThemeToggler from "@/components/ThemeToggler";

const navLinks = ['/about', '/projects', '/blog', '/contact'];

const Header = () => {
    return (
        // Added mt-4 for top margin, ml-4 for left margin, and mr-4 for right margin
        <header className="flex justify-between items-center gap-4 mt-4 ml-4 mr-8">
            <Link href="/" passHref>
                <span className="text-lg font-semibold tracking-wide cursor-pointer">
                    Your Name
                </span>
            </Link>
            <nav className="flex items-center gap-4">
                {navLinks.map((path, index) => (
                    <Link key={index} href={path} passHref>
                        <span className="text-sm font-medium hover:text-primary cursor-pointer">
                            {path.substring(1).charAt(0).toUpperCase() + path.slice(2)}
                        </span>
                    </Link>
                ))}
                <ThemeToggler />
            </nav>
        </header>
    );
};

export default React.memo(Header);
