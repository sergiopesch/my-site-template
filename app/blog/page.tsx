import Link from "next/link";
import Image from 'next/image';

export default function BlogPosts() {
    return (
        <main className="flex-1">
            <section className="w-full flex flex-col items-center justify-center space-y-1 lg:space-y-2 py-10 lg:py-20">
                <div className="px-4 md:px-6 space-y-7 xl:space-y-10">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">Blog Posts</h1>
                    <div className="mx-auto max-w-[700px] grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Link href="#">
                            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg">
                                <Image
                                    src="/placeholder.svg"
                                    alt="Blog 1"
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-40 h-40 object-cover rounded-lg mb-4"
                                />
                                <h2 className="text-xl font-bold text-center">Blog 1</h2>
                                <p className="text-gray-500 text-center leading-relaxed">A brief description of Blog 1.</p>
                            </div>
                        </Link>
                        <Link href="#">
                            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg">
                                <Image
                                    src="/placeholder.svg"
                                    alt="Blog 2"
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-40 h-40 object-cover rounded-lg mb-4"
                                />
                                <h2 className="text-xl font-bold text-center">Blog 2</h2>
                                <p className="text-gray-500 text-center leading-relaxed">A brief description of Blog 2.</p>
                            </div>
                        </Link>
                        <Link href="#">
                            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg">
                                <Image
                                    src="/placeholder.svg"
                                    alt="Blog 3"
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-40 h-40 object-cover rounded-lg mb-4"
                                />
                                <h2 className="text-xl font-bold text-center">Blog 3</h2>
                                <p className="text-gray-500 text-center leading-relaxed">A brief description of Blog 3.</p>
                            </div>
                        </Link>
                        <Link href="#">
                            <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg">
                                <Image
                                    src="/placeholder.svg"
                                    alt="Blog 4"
                                    layout="fill"
                                    objectFit="cover"
                                    className="w-40 h-40 object-cover rounded-lg mb-4"
                                />
                                <h2 className="text-xl font-bold text-center">Blog 4</h2>
                                <p className="text-gray-500 text-center leading-relaxed">A brief description of Blog 4.</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
            </main>
    );
}