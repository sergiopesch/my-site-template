
export default function Component() {
  return (
    <div key="1" className="flex flex-col min-h-screen bg-gray-100 text-gray-900 px-4 sm:px-6 md:px-8 lg:px-10">
      <main className="flex-1 mt-24 bg-gray-100">
        <section className="w-full flex flex-col items-center justify-center space-y-1 lg:space-y-2 py-1 lg:py-2">
          <div className="px-4 md:px-6 space-y-7 xl:space-y-10">
            <img
              className="w-40 h-40 rounded-full object-cover mb-6 mx-auto"
              height="200"
              src="/placeholder.svg"
              style={{
                aspectRatio: "200/200",
                objectFit: "cover",
              }}
              width="200"
            />
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">About Me</h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center leading-relaxed">
              I'm Your Name, a curious human based in Your City. I have a passion for web development and enjoy creating
              user-friendly, effective, and impactful digital experiences. I have a diverse set of skills ranging from
              design, to HTML + CSS + JavaScript, all the way to modern libraries and frameworks.
            </p>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 text-center leading-relaxed">
              In my free time, I love to explore the latest technology advancements in the web development world. When
              I'm not coding or pushing pixels, you'll find me in the gym or on the court playing basketball. I'm always
              looking to connect with other developers and designers, so feel free to reach out if you'd like to
              collaborate on a project, or just chat about the latest and greatest in web development.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
