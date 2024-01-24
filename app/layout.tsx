import Link from "next/link";
import { Inter } from 'next/font/google';
import './globals.css';
import { ModeToggle } from '@/components/DarkModeToggle';
import { ThemeProvider } from "next-themes";
const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <div className="flex flex-col min-h-screen mx-4 sm:mx-6 md:mx-8 lg:mx-10">
      {/* Header */}
      
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
        <ModeToggle />
        
        </nav>
        </header>
      {/* Main Content */}
      
        <main className="flex-1">
          {children}
        </main>
      

        {/* Footer */}
      <footer className="py-6 text-gray-900">
        <p className="text-xs sm:text-sm text-center">© Your Name. All rights reserved.</p>
        </footer>
        
      </div>
    
    
  );
}