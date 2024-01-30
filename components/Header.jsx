import React from "react";
import Link from "next/link";
import ThemeToggler from "@/components/ThemeToggler";

const Header = () => {
    return (
        <header className="px-4 lg:px-6 py-6 flex items-center justify-between space-x-4 lg:space-x-6">
            <Link href="/" className="text-lg font-bold tracking-wider text-gray-900 hover:text-gray-700">
                Your Name
            </Link>
            <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4">
                    About
                </Link>
                <Link href="/projects" className="text-sm font-medium hover:underline underline-offset-4">
                    Projects
                </Link>
                <Link href="/blog" className="text-sm font-medium hover:underline underline-offset-4">
                    Blog
                </Link>

                <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4">
                    Contact
                </Link>

                <ThemeToggler />

            </nav>

        </header>

    );
}
export default Header;

