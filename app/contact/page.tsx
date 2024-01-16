import Link from 'next/link';

export default function Contac() {
        return (
                <main className="flex-1">
                <section className="w-full flex flex-col items-center justify-center space-y-1 lg:space-y-2 py-10 lg:py-20">
                    <div className="px-4 md:px-6 space-y-7 xl:space-y-10">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">Contact Me</h1>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center leading-relaxed">
                            If you're looking to connect, drop me a line, and let's blend ideas like mismatched socks on an adventurous Tuesday!
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link href="#">
                                <LinkedinIcon className="h-6 w-6" />
                            </Link>
                            <Link href="#">
                                <MailIcon className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
}

function LinkedinIcon(props: any) {
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
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect width="4" height="12" x="2" y="9" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    )
}

function MailIcon(props: any) {
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
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
        )
}

