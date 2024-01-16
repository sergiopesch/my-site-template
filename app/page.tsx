export default function Component() {
  return (
    <div key="1" className="flex flex-col min-h-screen bg-gray-100 text-gray-900 px-4 sm:px-6 md:px-8 lg:px-10">
      <main className="flex-1 mt-24 bg-gray-100 flex items-center justify-center">
        <section className="w-full max-w-[700px] flex flex-col items-center justify-center px-4 md:px-6 space-y-7 xl:space-y-7 mb-10">
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
