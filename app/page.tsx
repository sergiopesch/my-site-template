export default function Component() {
  return (
    <div key="1" className="flex flex-col min-h-screen bg-gray-100 text-gray-900 mx-4 sm:mx-6 md:mx-8 lg:mx-10">
      <main className="flex-grow flex items-start justify-center">
        <section className="w-full max-w-[700px] flex flex-col items-center justify-center px-4 md:px-6 space-y-7 xl:space-y-7 mt-48">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
            Welcome to Your Personal Website Template
          </h1>
          <p className="text-gray-500 md:text-xl dark:text-gray-400 text-center">
            I'm Your Name, a curious human based in Your City. Here you can learn more about me, see my projects and
            blog posts. Let's connect!
          </p>
        </section>
      </main>
    </div>
  )
}
