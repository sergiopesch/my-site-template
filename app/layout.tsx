import Link from "next/link";
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

function SunIcon(props : any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      <div className="flex flex-col min-h-screen mx-4 sm:mx-6 md:mx-8 lg:mx-10">
        {/* Header */}
        <header className="bg-gray-100 px-4 lg:px-6 py-6 flex items-center justify-between space-x-4 lg:space-x-6">
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
        <SunIcon className="h-4 w-4 align-middle" />
        </nav>
        </header>
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
      <footer className="py-6 bg-gray-100 text-gray-900">
        <p className="text-xs sm:text-sm text-center">© Your Name. All rights reserved.</p>
      </footer>
      </div>
      
    
  );
}
