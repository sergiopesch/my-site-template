import React from "react";
import Link from "next/link";
import ThemeToggler from "@/components/ThemeToggler";

const navLinks = ['/about', '/projects', '/blog', '/contact'];

const Header = () => {
    return (
        <header className="flex justify-between items-center gap-4">
            <Link href="/" passHref>
                <span className="text-lg font-semibold tracking-wide cursor-pointer">
                    Your Name
                </span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
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