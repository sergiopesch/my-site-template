import Image from "next/image";

export default function About() {
  return (
    
      <main className="flex-1">
        <section className="w-full flex flex-col items-center justify-center space-y-1 lg:space-y-2 py-10 lg:py-20">
          <div className="px-4 md:px-6 space-y-7 xl:space-y-10">
            <Image
            src="/profilepic200x200.png"
            height={200}
            width={200}
            alt="Profile picture"
            className="w-40 h-40 rounded-full object-cover mb-6 mx-auto"
            />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">About Me</h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center leading-relaxed">
            I once tried yoga and achieved a state of unconsciousness, which I hear is the point. I&apos;m an
            enthusiast of fine dining at any place with a drive-thru. My life goal is to find socks that match
            and I believe in living every day like it&apos;s Tuesday — the potential is limitless.
            </p>
            
          </div>
        </section>
      </main>
    
  )
}
