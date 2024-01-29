import Link from 'next/link';
import Image from 'next/image';

const blog = [
    { id: 1, title: 'Blog 1', description: 'A brief description of Blog 1', imageUrl: '/placeholder.svg' },
    { id: 2, title: 'Blog 2', description: 'A brief description of Blog 2', imageUrl: '/placeholder.svg' },
    
];

export default function BlogPost() {
    return (
        <main className="flex-1">
            <section className="w-full flex flex-col items-center justify-center space-y-1 lg:space-y-2 py-10 lg:py-20">
                <div className="px-4 md:px-6 space-y-7 xl:space-y-10">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">My Blog</h1>
                    <div className="mx-auto max-w-[700px] grid grid-cols-1 md:grid-cols-2 gap-8">
                        {blog.map(blog => (
                            <Link key={blog.id} href={`/blog/blog-${blog.id}`} passHref>
                                <div className="flex flex-col items-center p-6 bg-white shadow-md rounded-lg">
                                    <Image
                                        src={blog.imageUrl}
                                        alt={blog.title}
                                        width={160} // Adjust width as needed
                                        height={160} // Adjust height as needed
                                        objectFit="cover"
                                        className="rounded-lg mb-4"
                                    />
                                    <h2 className="text-xl font-bold text-center">{blog.title}</h2>
                                    <p className="text-gray-500 text-center leading-relaxed">{blog.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
